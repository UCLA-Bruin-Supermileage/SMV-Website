
import React from 'react';
import { NavLink } from '../app/types';
import './navBar.css';

//import './NavigationBar.css'; // We'll add some basic styling later

interface NavigationBarProps {
  links: NavLink[];
}

const NavigationBar: React.FC<NavigationBarProps> = ({ links }) => {
  return ( 
    
    <nav className="navbar">    
      <ul className="nav-list" >
      {links && links.map((link, index) => (
      <li key={index} className="nav-item">
    <a href={link.url} className="nav-link">
      {link.title}
    </a>
  </li>
))}
      </ul>
    </nav>
  );
};



export default NavigationBar;