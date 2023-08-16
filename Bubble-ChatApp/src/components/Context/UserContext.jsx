import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [username, setLoggedInUserName] = useState(null);
  const [id, setId] = useState(null);
  const [email, setEmail] = useState(null);
  const [pic, setPic] = useState(null);
  
  useEffect(() => {
    if (document.cookie) {
      axios.get("/user/profile")
        .then((response) => {
          setLoggedInUserName(response.data.name);
          setId(response.data._id);
          setEmail(response.data.email)
          setPic(response.data.pic)
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, []);

  return (
    <UserContext.Provider value={{ username, id, email, pic, setLoggedInUserName, setId, setEmail, setPic}}>
      {children}
    </UserContext.Provider>
  );
}

UserContextProvider.propTypes = {
  children: PropTypes.object.isRequired,
};
