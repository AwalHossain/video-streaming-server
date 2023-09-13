import React from 'react';
import './animat.css'; // Import the CSS file for rocket animation

function RocketAnimation() {
    return (
        <div className="rocket-container">
            <div className="rocket">
                <div className="body"></div>
                <div className="fire"></div>
            </div>
        </div>
    );
}

export default RocketAnimation;
