import React from 'react';

let init: any = {};
const { Provider: MovieProvider, Consumer: MovieConsumer } = React.createContext(init);

export { MovieProvider, MovieConsumer };
