import React from 'react';
import { Outlet } from 'react-router-dom';


const DefaultLayout = ({ notSticky, largerPadding }) => {
  return (
    <div className="min-h-screen bg-[#F5F7F8]">
      <div className="ignore_in_print">

      </div>
      <main>
        <Outlet />
      </main>
      <div className="ignore_in_print">

      </div>
    </div>
  );
};

export default DefaultLayout;