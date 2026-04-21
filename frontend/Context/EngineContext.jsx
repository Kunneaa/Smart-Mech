import React, { createContext, useContext, useState } from "react";

const EngineContext = createContext();

export const useEngine = () => useContext(EngineContext);

export const EngineProvider = ({ children }) => {
  const [listMonitor, setListMonitor] = useState([]);
  const contextValue = {
    listMonitor,
    setListMonitor,
  };

  return (
    <EngineContext.Provider
      value={contextValue}
    >
      {children}
    </EngineContext.Provider>
  )
}