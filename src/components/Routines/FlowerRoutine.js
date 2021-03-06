import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { MdChevronRight, MdClose, MdChevronLeft } from 'react-icons/md'

import { getCirclePosX, getCirclePosY } from '../Flower/DefaultFunctions'
import { FLAVORS } from '../../Defaults'

import { stopAddFlowerRoutine, addFlower,
  editFlower, stopEditFlowerRoutine } from '../../state/globals/actions'

import VideoLinker from './VideoLinker'
import VideoPlayer from '../VideoPlayer/VideoPlayer'
import TitleInput from './TitleInput'

import FloatingButton from '../UI/FloatingButton'

import style from './Routines.module.css'
import WebRecorder from './WebRecorder'

const PHASES = [
  { name: 'RECORD_VIDEO', title: 'Record a video' },
  { name: 'ADD_META', title: 'Provide additional information.' }
]

class FlowerRoutine extends React.Component {
  constructor (props) {
    super(props)
    const { globals } = props

    const selectedFlower = (globals.editFlowerRoutineRunning && globals.editFlowerStatus.flower)
      ? globals.editFlowerStatus.flower
      : undefined

    this.state = {
      phase: 0,
      animationsFinished: false,
      videoLink: (selectedFlower) ? `https://www.youtube.com/watch?v=${selectedFlower.url}` : '',
      videoFile: undefined,
      duration: 0,
      title: (selectedFlower) ? selectedFlower.title : '',
      description: (selectedFlower) ? selectedFlower.description : '',
      isValidInput: false,
      selectedFlower,
      form: ''
    }
  }

  componentDidUpdate () {
    const { globals } = this.props
    const { phase } = this.state
    if (PHASES[phase].name === 'ADD_META' && globals.addFlowerRoutineRunning && globals.addFlowerStatus.finished) {
      this.props.stopAddFlowerRoutine()
    } else if (PHASES[phase].name === 'ADD_META' && globals.editFlowerRoutineRunning && globals.editFlowerStatus.finished) {
      this.props.stopEditFlowerRoutine()
    }
  }

  nextPhase = () => {
    const { phase } = this.state
    const nextPhase = phase + 1
    if (PHASES[nextPhase].name === 'POSITION') {
      this.props.nodeGetsPositioned(true)
      this.setState({
        phase: nextPhase
      }, () => {
        setTimeout(() => {
          this.setState({
            animationsFinished: true
          })
        }, 500)
      })
    } else {
      this.setState({
        phase: nextPhase
      })
    }
  }

  recorderFinished = (videoFile, duration) => {
    const formData = new FormData()
    formData.append('video', videoFile.data)
    fetch(`${process.env.REACT_APP_SERVER_URL}/api/uploadVideo`,
      {
        credentials: 'include',
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(json => {
        this.setState({
          videoFile,
          videoLink: 'https://vimeo.com/' + json.uri.split('/')[2],
          isValidInput: true,
          duration
        })
      })
  }

  setValidInput = (isValid) => {
    if (isValid !== this.state.validInput) {
      this.setState({ isValidInput: isValid })
    }
  }

  onSubmit = () => {
    const { globals } = this.props
    const {
      title, description, videoLink, duration
    } = this.state
    const data = {
      title,
      description,
      type: 'vimeo',
      link: videoLink,
      id: globals.editFlowerStatus.id,
      duration
    }
    if (globals.addFlowerRoutineRunning) {
      this.props.addFlower(data)
    } else if (globals.editFlowerRoutineRunning) {
      this.props.editFlower(data)
    }
  }

  render () {
    const { desiredValue, phase, animationsFinished, videoLink,
      isValidInput, title, description, currentProgress } = this.state
    const { dimensions, globals } = this.props

    const angle = ((desiredValue !== -1) ? desiredValue : currentProgress) * 360
    const currentRoutine = (globals.editFlowerRoutineRunning) ? globals.editFlowerStatus : globals.addFlowerStatus
    const currentPhase = PHASES[phase]

    let translateX
    let translateY
    let scale
    switch (currentPhase.name) {
      case 'ADD_META':
        translateX = dimensions.centerX
        translateY = dimensions.centerY - 0.3 * dimensions.centerY
        scale = 0.8
        break
      case 'POSITION':
        translateX = getCirclePosX(dimensions.rootRadius + (dimensions.rootRadius * 0.4), angle, dimensions.centerX)
        translateY = getCirclePosY(dimensions.rootRadius + (dimensions.rootRadius * 0.4), angle, dimensions.centerY)
        scale = 0.4
        break
      default:
        translateX = dimensions.centerX
        translateY = dimensions.centerY
        scale = 1
    }

    return [
      <div
        key='mainContainer'
        className={style.container}
      >
        <h2 className={style.phaseTitle}>{currentPhase.title}</h2>
        {currentPhase.name === 'ADD_META' &&
          <TitleInput
            title={title}
            description={description}
            setValidInput={this.setValidInput}
            setTitle={(title) => { this.setState({ title }) }}
            setDescription={(description) => { this.setState({ description }) }}
          />
        }
        {currentPhase.name !== 'ADD_META' &&
          <FloatingButton
            className={style.next}
            style={{
              border: `2px solid ${(isValidInput) ? '#222642' : 'grey'}`,
              background: (isValidInput) ? '#222642' : 'grey'
            }}
            onClick={this.nextPhase}
            deactivated={!isValidInput}
            round
          >
            <MdChevronRight
              size={30}
              color={'white'}
            />
          </FloatingButton>
        }
        {currentPhase.name === 'ADD_META' &&
        <FloatingButton
          className={style.next}
          style={{
            border: `2px solid ${(!currentRoutine.loading) ? '#222642' : 'grey'}`,
            background: (!currentRoutine.loading) ? '#222642' : 'grey'
          }}
          onClick={this.onSubmit}
          deactivated={currentRoutine.loading}
        >
          {(globals.addFlowerRoutineRunning) ? 'Create Flower' : 'Edit Flower'}
        </FloatingButton>
        }
        <FloatingButton
          className={style.abort}
          style={{
            border: '2px solid #222642',
            background: 'white'
          }}
          onClick={() => {
            this.props.stopAddFlowerRoutine()
            this.props.stopEditFlowerRoutine()
          }}
          round
        >
          <MdClose
            size={25}
            color={'#222642'}
          />
        </FloatingButton>
      </div>,
      <div
        key='petalContainer'
        className={style.petalContainer}
        style={{
          transform: `translate(${translateX}px, ${translateY}px)`,
          transition: (animationsFinished) ? 'none' : 'transform 400ms ease-out'
        }}
      >
        <div
          className={style.petal}
          style={{
            transform: `translate(-50%, -50%) scale(${scale})`,
            transition: 'transform 400ms ease-out',
            width: `${dimensions.rootSize}px`,
            height: `${dimensions.rootSize}px`
          }}
          ref={(ref) => { this.container = ref }}
        >
          <WebRecorder
            finished={this.recorderFinished}
            size={dimensions.rootSize}
            showControls
            setValidInput={this.setValidInput}
            videoLink={videoLink}
            setVideoLink={(videoLink) => { this.setState({ videoLink }) }}
            setTitle={(title) => { this.setState({ title }) }}
            setDuration={(duration) => { this.setState({ duration, targetOut: duration }) }}
          />
          {/* {((currentPhase.name === 'LINK_VIDEO' && isValidInput) ||
          currentPhase.name !== 'LINK_VIDEO') &&
          <VideoPlayer
            url={videoLink}
            color={'grey'}
            r={dimensions.rootRadius}
            isSelectedPetal={(currentPhase.name !== 'ADD_META')}
            wasSelected
            hideControls={(currentPhase.name === 'ADD_META')}
            shouldUpdate={(currentPhase.name !== 'ADD_META')}
          />
          } */}
        </div>
      </div>,
      <div
        key='hiddenField'
        ref={(ref) => { this.hiddenForm = ref }}
        style={{
          display: 'none'
        }}
        dangerouslySetInnerHTML={{ __html: this.state.form }}
      />
    ]
  }
}

FlowerRoutine.defaultProps = {
  rootDuration: 0,
  currentTime: 0,
  currentProgress: 0
}

FlowerRoutine.propTypes = {
  // id: PropTypes.string.isRequired,
  rootDuration: PropTypes.number,
  currentTime: PropTypes.number,
  currentProgress: PropTypes.number
}

function mapStateToProps (state) {
  const { dimensions, session, globals, flowerData } = state
  return { dimensions, session, globals, flowerData }
}

const mapDispatchToProps = {
  stopAddFlowerRoutine,
  addFlower,
  editFlower,
  stopEditFlowerRoutine
}

export default connect(mapStateToProps, mapDispatchToProps)(FlowerRoutine)
