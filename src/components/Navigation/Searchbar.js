import React from 'react'
import { MdSearch } from 'react-icons/md'

import style from './Searchbar.module.css'

class Searchbar extends React.Component {
  render () {
    return (
      <div className={style.container}>
        <input className={style.input} />
        <MdSearch className={style.icon} size={20} />
      </div>
    )
  }
}

export default Searchbar
