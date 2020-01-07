//@flow
import React from 'react';

type FakeFiltersContextType = {
  domainId: string[] | string | null,
};

const initialState: FakeFiltersContextType = {
  domainId: null,
};

// Fake filters context is used to make a kind stub for filters
// in place where we need them but don't have much sense to populate them in browser URL
// For ex. for the scheduled reports filters
const FakeFiltersContext = React.createContext(initialState);

export default FakeFiltersContext;
