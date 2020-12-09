/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import {
  Divider,
  Drawer, List, ListItem, ListItemText, makeStyles, Typography,
} from '@material-ui/core';
import './ContactComponent.css';
import ReactSearchBox from 'react-search-box';
import { Link, useHistory } from 'react-router-dom';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Button from '@material-ui/core/Button';
import React, {
  useState, useEffect, useRef, useContext, setState,
} from 'react';
// or

const styles = makeStyles(() => ({
  drawerPaper: {
    width: '20%',
    backgroundColor: '#212121',
    color: '#fff',
  },
}));

const useStyles = makeStyles({
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
});

function SearchComponent({ contactList, data }) {
  const [swipeState, setSwipe] = useState(true);
  const toggleDrawer = (open) => (event) => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setSwipe({ swipeState, open });
  };
  const styleObj = styles();
  return (
    <div>
      <Button onClick={toggleDrawer(true)}> To Search!! </Button>
      <React.Fragment key="right">
        <SwipeableDrawer classes={{ paper: styleObj.drawerPaper }} open={swipeState} anchor="right" onClose={toggleDrawer(false)} onOpen={toggleDrawer(true)}>
          <br />
          <div className="headerWrapper">
            asdfasdf
          </div>
          <br />
          <Divider id="dividerBar" />
          <br />
        </SwipeableDrawer>
      </React.Fragment>
    </div>
  );
}

export default SearchComponent;
