import React from 'react'

const Tab = props => {
  return (
    <>
      {props.children}
    </>
  )
}

const TabButtons = ({ buttons, changeTab, activeTab }) => {
  return (
    <div className='tab-buttons' style={{ width: 300 }}>
      {buttons.map((button, i) => {
        return <button id={button} key={i} className={button === activeTab ? 'tabButton active ' + button : 'tabButton'} onClick={() => changeTab(button)}>{button}</button>
      })}
      <div className='bottomLine' />
    </div>
  )
}

class Tabs extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      activeTab: this.props.activeTab
    }
    this.changeTab = this.props.handleTabClick
  }

  // changeTab (tab) {
  //   this.setState({ activeTab: tab })
  // }

  render () {
    const buttons = []
    return (
      <div>
        {this.props.tabs.map(tab => {
          buttons.push(tab)
          return null
        })}

        <TabButtons activeTab={this.props.activeTab} buttons={buttons} changeTab={this.changeTab} />

      </div>
    )
  }
}

export {
  Tabs,
  TabButtons,
  Tab
}
