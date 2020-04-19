import React from 'react'

function BottomLine (props) {
  return (
    <div className='buttomLine' />
  )
}

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
      activeTab: this.props.children[1].props.label
    }
    this.changeTab = this.changeTab.bind(this)
  }

  changeTab (tab) {
    this.setState({ activeTab: tab })
  }

  render () {
    let content
    const buttons = []
    return (
      <div>
        {React.Children.map(this.props.children, child => {
          buttons.push(child.props.label)
          if (child.props.label === this.state.activeTab) content = child.props.children
        })}

        <TabButtons activeTab={this.state.activeTab} buttons={buttons} changeTab={this.changeTab} />
        <div className='overflow-hidden'>
          {content}
        </div>


      </div>
    )
  }
}

export {
  Tabs,
  TabButtons,
  Tab
}
