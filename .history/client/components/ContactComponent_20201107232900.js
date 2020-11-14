/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import { Drawer } from '@material-ui/core';
import ReactSearchBox from 'react-search-box';

function ContactComponent({ contactList }) {
  const listItems = contactList.map((contact) => <p>{contact}</p>);
  return (
    <div>
      <h2>Contacts</h2>
      <ReactSearchBox
        placeholder="contact name"
        value="Doe"
        data={data}
        callback={(record) => console.log(record)}
      />
      <div id="contactList">
        {listItems}
      </div>
    </div>
  );
}

export default ContactComponent;
