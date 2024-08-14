// src/components/ExpenseTable.js
import React from 'react';
import '../styles/ExpenseTable.css';

function ExpenseTable({ expenses }) {
  return (
    <table className="expense-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Montant</th>
          <th>Catégorie</th>
        </tr>
      </thead>
      <tbody>
        {expenses.map((expense, index) => (
          <tr key={index}>
            <td>{expense.date}</td>
            <td>{expense.description}</td>
            <td>{expense.amount} €</td>
            <td>{expense.category}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ExpenseTable;
