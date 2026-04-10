const noop = () => {};

export default {
  runtime: {
    onMessage: {
      addListener: noop,
      removeListener: noop,
    },
    sendMessage: noop,
    connect: noop,
  },
  storage: {
    local: {
      get: noop,
      set: noop,
      remove: noop,
      clear: noop,
    },
    session: {
      get: noop,
      set: noop,
      remove: noop,
      clear: noop,
    },
  },
};
