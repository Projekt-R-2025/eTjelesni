import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

import './konzultacije.css';

function Konzultacije() {
    return (
        <>
            <Navbar></Navbar>
            <div className='okvirZK'>
                <h1 className='naslovKonzultacije'>
                    Obavezni kolegij: Tjelesna i zdravstvena kultura
                </h1>
                <hr></hr>
                <div className='sadrzajKonzultacije'>

                    <h2>Nastavnici:</h2>

                    <p>
                        <strong>Nera Žigić, prof.</strong> – nositelj predmeta
                    </p>
                    <p>e-mail: <a href="mailto:nera.zigic@fer.hr">nera.zigic@fer.hr</a></p>
                    <p>
                        Lokacija: <a href="https://www.google.com/maps/search/Dom+Ko%C5%A1arke+Cedevita+ulica+Radoslava+Cimermana+1+Velesajam" target="_blank" rel="noopener noreferrer">Dom Košarke Cedevita – ulica Radoslava Cimermana 1, Velesajam</a>
                    </p>

                    <h3>Konzultacije:</h3>
                    <ul>
                        <li>
                            četvrtkom od 12:00 – 13:15 – lokacija: <a href="https://www.google.com/maps/search/Dom+Ko%C5%A1arke+Cedevita" target="_blank" rel="noopener noreferrer">Dom košarke Cedevita</a>
                            (važi samo za tjedne u vrijeme nastave)
                        </li>
                        <li>
                            po dogovoru putem e-maila: <a href="mailto:nera.zigic@fer.hr">nera.zigic@fer.hr</a>
                        </li>
                        <li>
                            termini konzultacija u periodu međuispita i ispitnih rokova
                            isključivo po dogovoru putem e-maila
                        </li>
                    </ul>

                    <div>
                        <strong>Aleksandar Pupac, prof.</strong> (vanjski suradnik)
                    </div>
                    <p>e-mail: <a href="mailto:aleksandar.pupac@fer.hr">aleksandar.pupac@fer.hr</a></p>
                </div>
            </div>
        </>

    );
}

export default Konzultacije;