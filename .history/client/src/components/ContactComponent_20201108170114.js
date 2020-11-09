/* eslint-disable no-console */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import { Drawer, List, ListItem, ListItemText } from '@material-ui/core';
import ReactSearchBox from 'react-search-box';
import { Link } from 'react-router-dom';
import './ContactComponent.css';

function ContactComponent({ contactList, data }) {
  const listItems = contactList.map((contact) => (
    // TODO: check contact obj
    <ListItem>
      <Link to={`/message/${contact.id}`}>
        <ListItemText primary={contact.username} />
      </Link>
    </ListItem>
  ));
  return (
    <Drawer id="drawerBar" open="true" variant="permanent" anchor="left">
      <h2>Contacts</h2>
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
