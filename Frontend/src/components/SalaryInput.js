import React, { useState, useEffect } from 'react';

function SalaryInput({ onSalaryChange }) {
  const [salary, setSalary] = useState(0);

  useEffect(() => {
    const fetchSalary = async () => {
      const response = await fetch('http://localhost:5000/salary');
      const amount = await response.json();
      setSalary(amount);
      onSalaryChange(amount);
    };

    fetchSalary();
  }, [onSalaryChange]);

  const handleSalaryChange = async (e) => {
    const newSalary = parseFloat(e.target.value);
    setSalary(newSalary);
    onSalaryChange(newSalary);

    await fetch('http://localhost:5000/salary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount: newSalary })
    });
  };

  return (
    <div className="salary-input">
      <label htmlFor="salary">Enter Salary: </label>
      <input
        type="number"
        id="salary"
        value={salary}
        onChange={handleSalaryChange}
      />
    </div>
  );
}

export default SalaryInput;
