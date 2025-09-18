import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';

export default function NewTask({ onTaskCreated }) {
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tailors, setTailors] = useState([]);
  const [selectedTailor, setSelectedTailor] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchTailors() {
      try {
        const res = await axios.get('/api/tailors');
        setTailors(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchTailors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskName || !dueDate) return alert('Please fill in task name and due date.');

    const newTask = {
      taskName,
      description,
      dueDate,
      assignedTailor: selectedTailor || null,
      status: "Pending",
      staffId: "123"
    };

    try {
      setLoading(true);
      const res = await axios.post('/api/orders', newTask);
      alert('Task created successfully!');
      setTaskName('');
      setDescription('');
      setDueDate('');
      setSelectedTailor('');
      if (onTaskCreated) onTaskCreated(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Create New Task">
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Task Name *</label>
          <input type="text" value={taskName} onChange={e => setTaskName(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Due Date *</label>
          <input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Assign Tailor (Optional)</label>
          <select value={selectedTailor} onChange={e => setSelectedTailor(e.target.value)}>
            <option value="">Select Tailor</option>
            {tailors.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
        </div>

        <button type="submit" className="primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Task'}
        </button>
      </form>
    </DashboardLayout>
  );
}
