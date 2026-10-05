import { lazy, Suspense } from 'react';
import { AddUser } from './components/addUser/AddUser';
import { EditUser } from './components/edituser/EditUser';
import { UserList } from './components/userList/UserList';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Nav } from './components/nav/nav';
import { LogIn } from './components/login/LogIn';
import { SignUp } from './components/signup/SignUp';
import { AuthProvider } from './context/authContext.jsx';
import { Home } from './components/home/Home';
import { Plants } from './components/plants/plants';
import { AddPlant } from './components/addplant/AddPlant';
import { SinglePlant } from './components/singleplant/SinglePlant';
import { EditPlant } from './components/editplant/EditPlant';
import { Landing } from './components/landing/Landing';
import { Faqs } from './components/faqs/Faqs';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DataStatus } from './components/garden/DataStatus';
import { CareProvider } from './context/careContext';
import { Loader } from './components/loader/loader';

const Garden = lazy(() => import('./components/garden/Garden').then((module) => ({ default: module.Garden })));

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Router basename={import.meta.env.BASE_URL}>
          <CareProvider>
          <Nav />
          <DataStatus />
            <Routes>
              <Route path='/' element={<Landing />} exact></Route>
              <Route path='/login' element={<LogIn />} exact></Route>
              <Route path='/signup' element={<SignUp />} exact></Route>
              <Route path='/faqs' element={<Faqs />} exact></Route>
              <Route path='/garden' element={<Suspense fallback={<Loader />}><Garden /></Suspense>}></Route>
              <Route element={<ProtectedRoute />}>
                <Route path='/home' element={<Home />} exact></Route>
                <Route path='/users' element={<UserList />} exact></Route>
                <Route path='/add-user' element={<AddUser />} exact></Route>
                <Route path='/edit-user/:id' element={<EditUser />} exact></Route>
                <Route path='/plants' element={<Plants />} exact></Route>
                <Route path='/plants/:id' element={<SinglePlant />} exact></Route>
                <Route path='/add-plant' element={<AddPlant />} exact></Route>
                <Route path='/edit-plant/:id' element={<EditPlant />} exact></Route>
              </Route>
            </Routes>
          </CareProvider>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;

