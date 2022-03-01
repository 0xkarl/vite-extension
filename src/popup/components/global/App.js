import { Switch, Route, Redirect } from 'react-router';
import makeStyles from '@material-ui/core/styles/makeStyles';

import { useVite } from '../../contexts/Vite';

import Error from '../../components/shared/Error';

import Unlock from '../../pages/Unlock';
import Settings from '../../pages/Settings';
import Connect from '../../pages/Connect';
import Send from '../../pages/Send';
import Transactions from '../../pages/Transactions';
import Confirm from '../../pages/Confirm';
import Account from '../../pages/Account';
import Landing from '../../pages/Landing';
import Import from '../../pages/Import';
import Register from '../../pages/Register';
import AddNetwork from '../../pages/AddNetwork';

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: 20,
  },
}));

function App() {
  const classes = useStyles();
  const { isReady, locked, address } = useVite();

  return !isReady ? null : (
    <div className={classes.container}>
      <Error />
      {locked ? (
        !address ? (
          <Switch>
            <Route exact path="/register" component={Register} />
            <Route exact path="/import" component={Import} />
            <Redirect to="/register" />
          </Switch>
        ) : (
          <Unlock />
        )
      ) : (
        <Switch>
          <Route exact path="/settings" component={Settings} />
          <Route exact path="/connect" component={Connect} />
          <Route exact path="/send/:token" component={Send} />
          <Route exact path="/transactions" component={Transactions} />
          <Route exact path="/confirm" component={Confirm} />
          <Route exact path="/account/:address" component={Account} />
          <Route exact path="/landing" component={Landing} />
          <Route exact path="/add-network" component={AddNetwork} />
          <Redirect to="/landing" />
        </Switch>
      )}
    </div>
  );
}

export default App;
