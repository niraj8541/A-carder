import React from 'react';
import { HashRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { ProductDetails } from './pages/ProductDetails';
import { UserDashboard } from './pages/UserDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

// NOTE: This application simulates a full-stack environment using localStorage.
// The default Super Admin credentials are: 
// Username: niraj2546
// Phone: 7070294070
// Password: 0852963741@Ap

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/login" component={Login} />
            <Route path="/product/:id" component={ProductDetails} />
            <Route path="/dashboard" component={UserDashboard} />
            <Route path="/admin" component={AdminDashboard} />
            <Redirect to="/" />
          </Switch>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;