/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
function ContactComponent({ contactList }) {
  const listItems = contactList.map((contact) => <p>{contact}</p>);
  return (
    <div>
      <h2>Contacts</h2>
      <div id="contactList">
        {listItems}
      </div>
    </div>
  );
}

export default ContactComponent;