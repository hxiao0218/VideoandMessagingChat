/* eslint-disable no-console */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import {
  Divider,
  Drawer, List, ListItem, ListItemText, makeStyles, Typography,
} from '@material-ui/core';
import ReactSearchBox from 'react-search-box';
import { Link } from 'react-router-dom';
import './ContactComponent.css';

const styles = makeStyles(() => ({
  drawerPaper: {
    width: '20%',
    backgroundColor: '#212121',
    color: '#fff',
  },
}));

function ContactComponent({ contactList, data }) {
  const listItems = contactList.map((contact) => (
    // TODO: check contact obj
    <ListItem>
      <Link to={`/message/${contact.id}`}>
        <ListItemText primary={contact.username} />
      </Link>
    </ListItem>
  ));
  const styleObj = styles();
  return (
    <Drawer className="drawerBar" open="true" variant="permanent" anchor="left" classes={{ paper: styleObj.drawerPaper }}>
      <br />
      <Typography variant="h6" noWrap>
        Contacts
      </Typography>
      <br />
      <Divider id="dividerBar" />
      <br />
      <ReactSearchBox
        placeholder="contact name"
        value="Doe"
        data={data}
        callback={(record) => console.log(record)}
      />
      <div id="contactList">
        <List>
          {listItems}
        </List>
      </div>
    </Drawer>
  );
}

export default ContactComponent;
