import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import { listFlowers } from '../../state/flowerList/actions'

import style from './Navigation.module.css'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import FlowerItem from './FlowerItem'
import Navbar from '../Navigation/Navbar'
import SidebarLeft from '../Navigation/SidebarLeft'
// import Searchbar from './Searchbar'

function TabPanel (props) {
  const { children, value, index } = props

  return (
    <div style={{ visibility: value === index ? 'visible' : 'hidden' }}>
      {children}
    </div>
  )
}

function a11yProps (index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`
  }
}

const tabStyle = {
  textTransform: 'none',
  color: 'white',
  fontWeight: 'bold',
  fontSize: '15px'
}

class Navigation extends React.Component {
  state = {
    value: 0
  }

  componentDidMount () {
    const { loading, finished } = this.props.flowerList
    if (!loading && !finished) {
      this.props.listFlowers()
    }
  }

  render () {
    const {
      flowerList,
      children,
      sideBarOpen,
      toggleSideBar,
      globals
    } = this.props
    const { value } = this.state
    return [
      <SidebarLeft
        key='sidebarLeft'
        sideBarOpen={sideBarOpen}
        toggleSideBar={toggleSideBar}
      >
        <AppBar
          position='static'
          color='primary'
          style={{
            width: '100%',
            boxShadow: 'none',
            marginTop: '1em',
            background: '#05082B'
          }}
        >
          <Tabs
            value={value}
            onChange={(event, newValue) => {
              this.setState({ value: newValue })
            }}
            indicatorColor='secondary'
            variant='scrollable'
            aria-label='flower tabs'
          >
            <Tab
              wrapped
              style={tabStyle}
              label='All'
              {...a11yProps(0)}
            />
            <Tab
              wrapped
              style={tabStyle}
              label='Newest'
              {...a11yProps(1)}
            />
            <Tab
              wrapped
              style={tabStyle}
              label='Self-Hosted'
              {...a11yProps(1)}
            />
          </Tabs>
        </AppBar>
        <TabPanel value={value} index={0}>
          {flowerList.finished &&
            !flowerList.error &&
            flowerList.list.map(flower => {
              return (
                <Link
                  className={style.linkContainer}
                  to={`/flower/${flower.node.id}`}
                  key={flower.node.id}
                >
                  <FlowerItem
                    title={flower.title}
                    videoId={flower.node.video.url}
                    description={flower.description || undefined}
                    created={new Date(flower.created)}
                    user={flower.user}
                    id={flower.id}
                    isSelected={
                      flower.node.id.toString() === globals.selectedFlower
                    }
                  />
                </Link>
              )
            })}
        </TabPanel>
        <TabPanel value={value} index={1}>
          Item Two
        </TabPanel>
      </SidebarLeft>,
      <Navbar key='navbar' />,
      <div key='children'>{children}</div>
    ]
  }
}

function mapStateToProps (state) {
  const { flowerList, settings, dispatch, globals } = state
  return { flowerList, settings, dispatch, globals }
}

const mapDispatchToProps = {
  listFlowers
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Navigation)
