import React, { Switch, Route, Redirect } from 'react-router';
import makeStyles from '@material-ui/core/styles/makeStyles';

import { useVite } from '../../contexts/Vite';
import Error from '../../components/shared/Error';
import Unlock from '../../pages/Unlock';
import Settings from '../../pages/Settings';
import Connect from '../../pages/Connect';
import Send from '../../pages/Send';
import Deposit from '../../pages/Deposit';
import Confirm from '../../pages/Confirm';
import Account from '../../pages/Account';
import Landing from '../../pages/Landing';
import Import from '../../pages/Import';
import Register from '../../pages/Register';
import AddNetwork from '../../pages/AddNetwork';
import Token from '../../pages/Token';
import Welcome from '../../pages/Welcome';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useStyles = makeStyles(() => ({
  container: {
    height: '100%',
  },
}));

function App() {
  const classes = useStyles();
  const { isReady, locked, address } = useVite();
  const { search } = useLocation();

  useEffect(() => {
    const { search, hash } = window.location;
    if (
      !(
        ~search.search('origin') ||
        ~hash.search('/import') ||
        ~hash.search('/register')
      )
    ) {
      document.body.classList.add('popup');
    }
    return () => {
      document.body.classList.remove('popup');
    };
  }, [search]);

  return !isReady ? null : (
    <div className={classes.container}>
      <Error />
      {locked ? (
        !address ? (
          <Switch>
            <Route exact path="/register" component={Register} />
            <Route exact path="/import" component={Import} />
            <Route exact path="/" component={Welcome} />
            <Redirect to="/" />
          </Switch>
        ) : (
          <Unlock />
        )
      ) : (
        <div className={'p-4'}>
          <Switch>
            <Route exact path="/settings" component={Settings} />
            <Route exact path="/connect" component={Connect} />
            <Route exact path="/deposit" component={Deposit} />
            <Route exact path="/send" component={Send} />
            <Route exact path="/confirm" component={Confirm} />
            <Route exact path="/account/:address" component={Account} />
            <Route exact path="/token/:token" component={Token} />
            <Route path="/landing" component={Landing} />
            <Route exact path="/add-network" component={AddNetwork} />
            <Redirect to="/landing" />
          </Switch>
        </div>
      )}
    </div>
  );
}

export default App;
