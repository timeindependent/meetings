import React from 'react'
import classNames from 'classnames'
import { toast } from 'react-toastify'
import getFileTypeExtension from '@uppy/utils/lib/getFileTypeExtension'
import { TiMediaRecord, TiMediaStop } from 'react-icons/ti'

import VideoPlayer from '../VideoPlayer/VideoPlayer'

import style from './WebRecorder.module.css'

const constraints = {
  audio: true,
  video: {
    facingMode: 'user',
    // width: 480,
    // height: 480
    width: { exact: 480 },
    height: { exact: 480 }
  }
}

/* Function copied from @uppy/webcam */
function getMediaDevices () {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    return navigator.mediaDevices
  }

  const getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia
  if (!getUserMedia) {
    return null
  }

  return {
    getUserMedia (opts) {
      return new Promise((resolve, reject) => {
        getUserMedia.call(navigator, opts, resolve, reject)
      })
    }
  }
}

class WebRecorder extends React.Component {
  state = {
    stream: '',
    recording: false,
    finished: false,
    videoURL: '',
    recorderReady: false,
    started: 0,
    ended: 0
  }

  constructor (props) {
    super(props)
    this.mediaDevices = getMediaDevices()
    this.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        this.stream = stream
        this.webcamPreview.srcObject = stream
        this.setState({
          recorderReady: true
        })
      })
      .catch(() => {
        toast.error('Your browser does not support video recording.')
      })
  }

  componentWillUnmount () {
    this.unregister()
  }

  record = () => {
    this.recorder = new MediaRecorder(this.stream)
    this.recordingChunks = []
    this.recorder.addEventListener('dataavailable', (event) => {
      this.recordingChunks.push(event.data)
    })

    this.recorder.start()
    this.setState({
      recording: true,
      started: new Date()
    })
  }

  unregister = () => {
    this.recordingChunks = null
    this.recorder = null
    if (this.stream) {
      this.stream.getAudioTracks().forEach((track) => {
        track.stop()
      })
      this.stream.getVideoTracks().forEach((track) => {
        track.stop()
      })
    }
  }

  stopRecord = () => {
    this.setState({
      ended: new Date()
    })
    const stopped = new Promise((resolve) => {
      this.recorder.addEventListener('stop', () => {
        resolve()
      })
      this.recorder.stop()
    })

    stopped.then(() => this.getVideo())
      .then((file) => {
        this.videoFile = file
        this.webcamPreview.srcObject = undefined
        this.props.finished(file, Math.round((this.state.ended - this.state.started) / 1000))
        // this.props.setValidInput(true)
        this.setState({
          recording: false,
          finished: true,
          videoURL: window.URL.createObjectURL(file.data)
        })
      })
      .then(() => {
        this.unregister()
      }, (error) => {
        this.unregister()
        toast.error(error.message)
      })
  }

  getVideo = () => {
    const mimeType = this.recordingChunks[0].type
    const fileExtension = getFileTypeExtension(mimeType)

    if (!fileExtension) {
      return Promise.reject(new Error(`Could not retrieve recording: Unsupported media type "${mimeType}"`))
    }

    const name = `NoID${Date.now()}.${fileExtension}`
    const blob = new Blob(this.recordingChunks, { type: mimeType })
    const file = {
      source: 'Webcam',
      name: name,
      // data: new Blob([blob], { type: mimeType }),
      data: blob,
      type: mimeType,
      size: blob.size,
      fileExtension
    }

    return Promise.resolve(file)
  }

  render () {
    const { recorderReady, recording, finished, videoURL } = this.state
    const { size, color, showControls } = this.props

    // TODO: issues with Timeline size due to required sizing of enclosing box
    const r = Math.floor(size * 0.5)

    return [
      <div
        className={style.videoContainer}
        key='video'
        style={{
          width: `${(r * 2) - 8}px`,
          height: `${(r * 2) - 8}px`
        }}
      >
        <video
          key='preview'
          height='100%'
          autoPlay
          muted
          className={style.video}
          loop
          playsInline
          ref={(ref) => { this.webcamPreview = ref }}
        />
      </div>,
      <div
        key='webcamPlayerContainer'
        style={{
          width: `${(r * 2) - 2}px`,
          height: `${(r * 2) - 2}px`
        }}
      >
        {finished &&
          <VideoPlayer
            key='webcamPlayer'
            url={videoURL}
            color={color}
            r={r}
            isSelectedPetal={showControls}
            isPetal={!showControls}
            wasSelected
            simple
            shouldUpdate
          />
        }
      </div>,
      <span key='controls'>
        {recorderReady &&
          [
            <TiMediaRecord
              key='recordButton'
              className={classNames(style.record, (recording || finished) ? style.recordClicked : '')}
              size={`${size * 0.25}px`}
              fill='red'
              style={{
                margin: `-${size * 0.125}px 0 0 -${size * 0.125}px`,
                pointerEvents: (recorderReady && !finished) ? 'all' : 'none'
              }}
              onClick={this.record}
            />,
            <TiMediaStop
              key='stopButton'
              className={classNames(style.stopRecord, (recording) ? style.recordStarted : '')}
              size={`${size * 0.25}px`}
              fill='red'
              style={{
                margin: `-${size * 0.125}px 0 0 -${size * 0.125}px`,
                pointerEvents: (recording) ? 'all' : 'none'
              }}
              onClick={this.stopRecord}
            />
          ]
        }
      </span>
    ]
  }
}

export default WebRecorder
