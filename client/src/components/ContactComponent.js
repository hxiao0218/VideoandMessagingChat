/* eslint-disable max-len */
/* eslint-disable no-console */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import {
  Divider,
  Drawer, List, ListItem, ListItemText, makeStyles, Typography,
} from '@material-ui/core';
import ReactSearchBox from 'react-search-box';
import { Link, useHistory } from 'react-router-dom';
import DeleteContactButton from './DeleteContactButton';
import './ContactComponent.css';

const styles = makeStyles(() => ({
  drawerPaper: {
    width: '20%',
    backgroundColor: '#212121',
    color: '#fff',
  },
}));

function ContactComponent({ contactList, data, currentUserId }) {
  console.log('contactlist in contactcomponent', contactList);
  const listItems = contactList.map((contact) => (
    // TODO: check contact obj
    <>
      <ListItem>
        <Link to={`/message/${contact.id}`}>
          <ListItemText primary={contact.username} />
        </Link>
      </ListItem>
      <DeleteContactButton userid={currentUserId} contactid={contact.id} conversationId={contact.sid} contactcid={contact.cid} />
    </>
  ));
  const styleObj = styles();
  const history = useHistory();
  return (
    <Drawer className="drawerBar" open="true" variant="permanent" anchor="left" classes={{ paper: styleObj.drawerPaper }}>
      <br />
      <div className="headerWrapper">
        <Typography variant="h6" noWrap>
          Contacts
        </Typography>
      </div>
      <br />
      <Divider id="dividerBar" />
      <br />
      <ReactSearchBox
        placeholder="contact name"
        data={data}
        id="searchBox"
        onSelect={(record) => history.push(`/message/${record.key}`)}
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
