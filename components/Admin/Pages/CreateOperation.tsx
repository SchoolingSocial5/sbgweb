import React, { useState } from 'react';

const DailyOperationsPage = () => {
    const [category, setCategory] = useState('Broiler');

    return (
        <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px', fontFamily: 'sans-serif' }}>
            <h2>Daily Operations Log</h2>
            <hr />

            {/* --- SECTION 1: GENERAL INFO --- */}
            <section>
                <h4>General Information</h4>
                <label>Date:</label>
                <input type="date" style={inputStyle} defaultValue={new Date().toISOString().split('T')[0]} />

                <label>Livestock Category:</label>
                <select
                    style={inputStyle}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="Broiler">Broiler</option>
                    <option value="Layer">Layer</option>
                    <option value="CatFish">Cat Fish</option>
                </select>

                <label>{category === 'CatFish' ? 'Pond Number:' : 'Batch ID:'}</label>
                <input type="text" placeholder="e.g. Batch A1 or Pond 4" style={inputStyle} />
            </section>

            {/* --- SECTION 2: NUTRITION & FEEDING --- */}
            <section style={sectionStyle}>
                <h4>Nutrition & Hydration</h4>
                <label>Feed Type Used:</label>
                <input type="text" placeholder={category === 'CatFish' ? "e.g. 2mm Floating" : "e.g. Starter Mash"} style={inputStyle} />

                <label>Quantity (Bags/kg):</label>
                <input type="number" style={inputStyle} />

                {category === 'CatFish' && (
                    <>
                        <label>Feeding Response:</label>
                        <select style={inputStyle}>
                            <option>Aggressive (Good)</option>
                            <option>Moderate</option>
                            <option>Poor</option>
                        </select>
                    </>
                )}
            </section>

            {/* --- SECTION 3: HEALTH & MEDICAL --- */}
            <section style={sectionStyle}>
                <h4>Health & Medical Care</h4>
                <label>Mortality (Deaths):</label>
                <input type="number" placeholder="0" style={inputStyle} />

                <label>Symptoms Noticed (if any):</label>
                <textarea placeholder="e.g. Sneezing, drooping wings, or skin lesions" style={inputStyle}></textarea>

                <label>Medication/Vaccine Administered:</label>
                <input type="text" placeholder="e.g. Gumboro, Lasota, or Organic Booster" style={inputStyle} />
            </section>

            {/* --- SECTION 4: PRODUCTION & ENVIRONMENT --- */}
            <section style={sectionStyle}>
                <h4>Production & Maintenance</h4>

                {category === 'Layer' && (
                    <>
                        <label>Total Eggs Collected:</label>
                        <input type="number" style={inputStyle} />
                        <label>Cracked/Bad Eggs:</label>
                        <input type="number" style={inputStyle} />
                    </>
                )}

                {category === 'CatFish' ? (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input type="checkbox" id="water" />
                        <label htmlFor="water">Partial/Full Water Change Done?</label>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input type="checkbox" id="litter" />
                        <label htmlFor="litter">Litter Turned/Raked?</label>
                    </div>
                )}
            </section>

            {/* --- SECTION 5: NOTES --- */}
            <section style={sectionStyle}>
                <label>Additional Observations:</label>
                <textarea placeholder="Any other info for the manager..." style={inputStyle}></textarea>
            </section>

            <button style={buttonStyle}>Submit Daily Log</button>
        </div>
    );
};

// Simple Styles
const inputStyle = { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc', display: 'block' };
const sectionStyle = { backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' };
const buttonStyle = { width: '100%', padding: '15px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' };

export default DailyOperationsPage;