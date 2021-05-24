import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { uuid } from "uuidv4";
import api from "../api/contacts";
import "./App.css";
import Header from "./Header";
import AddContact from "./AddContact";
import ContactList from "./ContactList";
import ContactDetail from "./ContactDetail";
import EditContact from "./EditContact";

function App() {
  const LOCAL_STORAGE_KEY = "contacts";
  const [contacts, setContacts] = useState([]);

  //RetrieveContacts
  const retrieveContacts = async () => {
    const response = await api.get("/contacts");
    return response.data;
  };

  const getOfflineData = async () => {
    const retriveContacts = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    if (retriveContacts) setContacts(retriveContacts);
    console.log(
      "offline, getting data from cache/localstorage",
      retriveContacts
    );
  };

  const addContactHandler = async (contact) => {
    console.log(contact);
    if (navigator.onLine) {
      const request = {
        id: uuid(),
        ...contact,
      };
      const response = await api.post("/contacts", request);
      setContacts([...contacts, response.data]);
    } else {
      const request = {
        id: uuid(),
        ...contact,
        offline: true,
      };

      setContacts([...contacts, request]);
    }
  };

  const updateContactHandler = async (contact) => {
    const response = await api.put(`/contacts/${contact.id}`, contact);
    const { id, name, email } = response.data;
    setContacts(
      contacts.map((contact) => {
        return contact.id === id ? { ...response.data } : contact;
      })
    );
  };

  const removeContactHandler = async (id) => {
    await api.delete(`/contacts/${id}`);
    const newContactList = contacts.filter((contact) => {
      return contact.id !== id;
    });

    setContacts(newContactList);
  };

  const onlineAgainHandler = async () => {
    let storageRecords = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    console.log(
      "online again",
      storageRecords.filter((item) => item.offline === true)
    );
    storageRecords = storageRecords.filter((item) => item.offline === true);
    for (let i = 0; i < storageRecords.length; i++) {
      const response = await api.post("/contacts", {
        id: storageRecords[i].id,
        name: storageRecords[i].name,
        email: storageRecords[i].email,
      });
      setContacts([...contacts, response.data]);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, []);
    getAllCOntacts();
  };

  const updateOnlineStatus = async (event) => {
    let condition = navigator.onLine ? "online" : "offline";
    if (condition === "online") {
      onlineAgainHandler();
    } else {
      getOfflineData();
    }
  };

  const getAllCOntacts = async () => {
    console.log("online, getting data from api");
    const allContacts = await retrieveContacts();

    const retriveContacts = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    let offlineRecords = retriveContacts.filter(
      (item) => item.offline === true
    );
    if (allContacts) setContacts([...offlineRecords, ...allContacts]);
  };

  useEffect(() => {
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    getAllCOntacts();
  }, []);

  useEffect(() => {
    if (contacts.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(contacts));
    }
  }, [contacts]);

  return (
    <div className="ui container">
      <Router>
        <Header />
        <Switch>
          <Route
            path="/"
            exact
            render={(props) => (
              <ContactList
                {...props}
                contacts={contacts}
                getContactId={removeContactHandler}
              />
            )}
          />
          <Route
            path="/add"
            render={(props) => (
              <AddContact {...props} addContactHandler={addContactHandler} />
            )}
          />

          <Route
            path="/edit"
            render={(props) => (
              <EditContact
                {...props}
                updateContactHandler={updateContactHandler}
              />
            )}
          />

          <Route path="/contact/:id" component={ContactDetail} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
