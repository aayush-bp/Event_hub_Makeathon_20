import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { ErrorAlert, SuccessAlert } from '../components/AlertComponents';
import { eventService } from '../services/eventService';
import { authService } from '../services/authService';
import { aiService } from '../services/aiService';
import { useAuth } from '../context/AuthContext';

export const CreateEventPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Tech',
    dateTime: '',
    duration: 120,
    locations: [],
    speakerIds: [],
    maxParticipants: 50,
  });
  const [locationInput, setLocationInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (user?.user?.role === 'ADMIN' || user?.role === 'ADMIN' || user?.user?.role === 'ORGANIZER' || user?.role === 'ORGANIZER') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const users = await authService.getAllUsers();
      setAllUsers(Array.isArray(users) ? users : []);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'duration' || name === 'maxParticipants' ? parseInt(value) : value,
    }));
  };

  const addLocation = () => {
    if (locationInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        locations: [...prev.locations, locationInput.trim()],
      }));
      setLocationInput('');
    }
  };

  const removeLocation = (index) => {
    setFormData((prev) => ({
      ...prev,
      locations: prev.locations.filter((_, i) => i !== index),
    }));
  };

  const handleSpeakerSelect = (e) => {
    const selectedId = e.target.value;
    if (selectedId && !formData.speakerIds.includes(selectedId)) {
      setFormData((prev) => ({
        ...prev,
        speakerIds: [...prev.speakerIds, selectedId],
      }));
    }
    e.target.value = '';
  };

  const removeSpeaker = (speakerId) => {
    setFormData((prev) => ({
      ...prev,
      speakerIds: prev.speakerIds.filter((id) => id !== speakerId),
    }));
  };

  const handleAIGenerate = async () => {
    if (!formData.title.trim()) {
      setError('Please enter an event title first');
      return;
    }
    try {
      setAiLoading(true);
      setError('');
      const details = await aiService.generateEventDetails(formData.title);
      setFormData((prev) => ({
        ...prev,
        description: details.description || prev.description,
        type: details.type || prev.type,
        duration: details.duration || prev.duration,
        maxParticipants: details.maxParticipants || prev.maxParticipants,
        locations: details.locations?.length ? details.locations : prev.locations,
      }));
    } catch (err) {
      setError('Failed to generate event details with AI');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim()) {
      setError('Event title is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Event description is required');
      return;
    }

    if (!formData.dateTime) {
      setError('Event date and time are required');
      return;
    }

    if (formData.locations.length === 0) {
      setError('At least one location is required');
      return;
    }

    try {
      setLoading(true);
      const eventPayload = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        dateTime: formData.dateTime,
        duration: formData.duration,
        locations: formData.locations,
        speakerIds: formData.speakerIds,
        maxParticipants: formData.maxParticipants,
      };
      await eventService.createEvent(eventPayload);
      setSuccess('Event created successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const userData = user?.user || user;
  const isAdmin = userData?.role === 'ADMIN';
  const canAssignSpeakers = userData?.role === 'ADMIN' || userData?.role === 'ORGANIZER';

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create New Event
            </h1>
            <p className="text-gray-600 mb-8">
              Fill in the details below to create your event
            </p>

            {error && (
              <ErrorAlert message={error} onClose={() => setError('')} />
            )}
            {success && (
              <SuccessAlert message={success} onClose={() => setSuccess('')} />
            )}

            <form onSubmit={handleSubmit} className="space-y-6 mt-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Enter event title"
                />
                <button
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={aiLoading}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 transition-all"
                >
                  <Sparkles size={16} className={aiLoading ? 'animate-spin' : ''} />
                  {aiLoading ? 'Generating...' : 'Auto-fill with AI'}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary h-24"
                  placeholder="Enter event description"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  >
                    <option value="Tech">Tech</option>
                    <option value="Business">Business</option>
                    <option value="Fun">Fun</option>
                    <option value="Sports">Sports</option>
                    <option value="Educational">Educational</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    min="30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date and Time
                </label>
                <input
                  type="datetime-local"
                  name="dateTime"
                  value={formData.dateTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              {/* Locations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Locations
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    placeholder="Enter location and press Enter or click Add"
                  />
                  <button
                    type="button"
                    onClick={addLocation}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
                {formData.locations.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.locations.map((location, index) => (
                      <div
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
                      >
                        {location}
                        <button
                          type="button"
                          onClick={() => removeLocation(index)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Speakers (for admin and organizer) */}
              {canAssignSpeakers && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign Speakers
                  </label>
                  <select
                    onChange={handleSpeakerSelect}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    defaultValue=""
                  >
                    <option value="">Select a speaker to add</option>
                    {allUsers.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.email}) - {u.dcLocation}
                      </option>
                    ))}
                  </select>
                  {formData.speakerIds.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.speakerIds.map((speakerId) => {
                        const speaker = allUsers.find((u) => u._id === speakerId);
                        return (
                          <div
                            key={speakerId}
                            className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full flex items-center gap-2"
                          >
                            {speaker?.name}
                            <button
                              type="button"
                              onClick={() => removeSpeaker(speakerId)}
                              className="text-purple-600 hover:text-purple-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Participants
                </label>
                <input
                  type="number"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  min="1"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Event'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
