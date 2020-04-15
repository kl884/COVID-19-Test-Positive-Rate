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
    <div className='tab-buttons'>
      {buttons.map((button, i) => {
        return <button key={i} className={button === activeTab ? 'active' : ''} onClick={() => changeTab(button)}>{button}</button>
      })}
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
        {content}

      </div>
    )
  }
}

export {
  Tabs,
  TabButtons,
  Tab
}
