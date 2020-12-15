/* eslint-disable max-len */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import React from 'react';
// import clsx from 'clsx';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Button from '@material-ui/core/Button';
import SearchIcon from '@material-ui/icons/Search';
import {
  Divider,
  Drawer, List, ListItem, ListItemText, makeStyles, Typography, IconButton,
} from '@material-ui/core';
import ReactSearchBox from 'react-search-box';
import DeleteContactButton from './DeleteContactButton';
import AddContactsComponent from './AddContactsComponent';
import './ContactComponent.css';

const useStyles = makeStyles({
  drawerPaper: {
    width: '20%',
    backgroundColor: '#212121',
    color: '#fff',
  },
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
});

export default function SearchSideBar({ contactList, data, currentUserId }) {
  console.log('contactlist in searchside bar', contactList);
  console.log('currentUserId in searchside bar', currentUserId);

  const classes = useStyles();
  const [state, setState] = React.useState({
    right: false,
  });

  const toggleDrawer = (anchor, open) => (event) => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const listItems = contactList.map((contact) => (
    // TODO: check contact obj
    <ListItem>
      <ListItemText primary={contact.username} />
      <AddContactsComponent userid={currentUserId} contactid={contact.id} />
    </ListItem>
  ));

  //   const list = (anchor) => (
  //     <div
  //       className={clsx(classes.list, {
  //         [classes.fullList]: anchor === 'top' || anchor === 'bottom',
  //       })}
  //       role="presentation"
  //       onClick={toggleDrawer(anchor, false)}
  //       onKeyDown={toggleDrawer(anchor, false)}
  //     >
  //       <List>
  //         {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
  //           <ListItem button key={text}>
  //             <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
  //             <ListItemText primary={text} />
  //           </ListItem>
  //         ))}
  //       </List>
  //       <Divider />
  //       <List>
  //         {['All mail', 'Trash', 'Spam'].map((text, index) => (
  //           <ListItem button key={text}>
  //             <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
  //             <ListItemText primary={text} />
  //           </ListItem>
  //         ))}
  //       </List>
  //     </div>
  //   );
  return (
    <div>
      {['right'].map((anchor) => (
        <React.Fragment key={anchor}>
          <IconButton aria-label="search" size="large" color="secondary" onClick={toggleDrawer(anchor, true)}>
            <SearchIcon />
          </IconButton>
          {/* <Button classes={{ paper: classes.drawerPaper }} onClick={toggleDrawer(anchor, true)}>{anchor}</Button> */}
          <SwipeableDrawer
            anchor={anchor}
            open={state[anchor]}
            onClose={toggleDrawer(anchor, false)}
            onOpen={toggleDrawer(anchor, true)}
          >
            <br />
            <div className="headerWrapper">
              <Typography variant="h6" noWrap>
                Add New Contacts
              </Typography>
            </div>
            <br />
            <Divider id="dividerBar" />
            <br />
            <ReactSearchBox
              placeholder="suggested contacts"
              data={data}
              id="searchBox"
            />
            <div id="alluserlist">
              <List>
                {listItems}
              </List>
            </div>
          </SwipeableDrawer>
        </React.Fragment>
      ))}
    </div>
  );
}
