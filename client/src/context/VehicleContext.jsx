import { createContext, useContext, useState } from 'react';

const VehicleContext = createContext({});

export const useVehicle = () => useContext(VehicleContext);

const defaultParams = {
  speed: 80, 
  engineTemp: 90, 
  rpm: 3000, 
  oilPressure: 40,
  tirePressure: 32, 
  batteryVoltage: 12.6, 
  fuelLevel: 65, 
  brakeThickness: 8,
};

export function VehicleProvider({ children }) {
  const [params, setParams] = useState(defaultParams);

  // Helper to update individual parameters easily
  const updateParam = (key, value) => {
    setParams(prev => ({ ...prev, [key]: Number(value) }));
  };

  const resetParams = () => {
    setParams(defaultParams);
  };

  return (
    <VehicleContext.Provider value={{ params, setParams, updateParam, resetParams }}>
      {children}
    </VehicleContext.Provider>
  );
}
