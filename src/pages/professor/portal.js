import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/ProfessorPortal.module.css';

function ProfessorPortal() {
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('professorToken');
    if (!token) {
      router.push('/professor/login');
      return;
    }

    fetchCourseData();
  }, [router]);

  const fetchCourseData = async () => {
    try {
      const response = await fetch('/api/courseData');
      const data = await response.json();
      setCourseData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('Error loading data');
    } finally {
      setLoading(false);
    }
  };

const createBackup = () => {
  const backup = JSON.stringify(courseData, null, 2);
  const blob = new Blob([backup], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `courseData-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
 const handleSave = async () => {
  setSaving(true);
  setMessage('');

  try {
    // Validate data before saving
    if (!courseData.topics || !Array.isArray(courseData.topics)) {
      setMessage('Error: Topics must be an array');
      setSaving(false);
      return;
    }

    if (!courseData.learningObjectives || !Array.isArray(courseData.learningObjectives)) {
      setMessage('Error: Learning objectives must be an array');
      setSaving(false);
      return;
    }

    if (!courseData.aiScope || typeof courseData.aiScope !== 'string') {
      setMessage('Error: AI scope must be a string');
      setSaving(false);
      return;
    }

    // Clean the data - remove empty questions
    const cleanedData = {
      ...courseData,
      topics: courseData.topics.map(topic => ({
        ...topic,
        questions: topic.questions.filter(q => q && q.trim() !== '')
      })).filter(topic => topic.title && topic.title.trim() !== ''),
      learningObjectives: courseData.learningObjectives.filter(obj => obj && obj.trim() !== '')
    };

    console.log('Saving cleaned data:', cleanedData);

    const token = localStorage.getItem('professorToken');
    const response = await fetch('/api/courseData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': token,
      },
      body: JSON.stringify(cleanedData),
    });

    const data = await response.json();
    console.log('Save response:', data);
    
    if (data.success) {
      setMessage('✓ Changes saved successfully!');
      setCourseData(cleanedData); // Update local state with cleaned data
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage(`Error: ${data.message || 'Failed to save changes'}`);
    }
  } catch (error) {
    console.error('Error saving:', error);
    setMessage(`Error: ${error.message}`);
  } finally {
    setSaving(false);
  }
};

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setMessage('Please upload a PDF file');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('professorToken');
      const response = await fetch('/api/upload-slides', {
        method: 'POST',
        headers: {
          'token': token,
        },
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('✓ Slides uploaded successfully!');
        setCourseData(prev => ({ ...prev, slidesFilename: data.filename }));
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error uploading file');
      }
    } catch (error) {
      console.error('Error uploading:', error);
      setMessage('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('professorToken');
    router.push('/professor/login');
  };

  const addTopic = () => {
    const newTopic = {
      id: Date.now(),
      title: 'New Topic',
      questions: ['Sample question 1', 'Sample question 2']
    };
    setCourseData(prev => ({
      ...prev,
      topics: [...prev.topics, newTopic]
    }));
  };

  const updateTopic = (index, field, value) => {
    const updatedTopics = [...courseData.topics];
    updatedTopics[index][field] = value;
    setCourseData(prev => ({ ...prev, topics: updatedTopics }));
  };

  const deleteTopic = (index) => {
    const updatedTopics = courseData.topics.filter((_, i) => i !== index);
    setCourseData(prev => ({ ...prev, topics: updatedTopics }));
  };

  const addQuestion = (topicIndex) => {
    const updatedTopics = [...courseData.topics];
    updatedTopics[topicIndex].questions.push('New question');
    setCourseData(prev => ({ ...prev, topics: updatedTopics }));
  };

  const updateQuestion = (topicIndex, questionIndex, value) => {
    const updatedTopics = [...courseData.topics];
    updatedTopics[topicIndex].questions[questionIndex] = value;
    setCourseData(prev => ({ ...prev, topics: updatedTopics }));
  };

  const deleteQuestion = (topicIndex, questionIndex) => {
    const updatedTopics = [...courseData.topics];
    updatedTopics[topicIndex].questions = updatedTopics[topicIndex].questions.filter((_, i) => i !== questionIndex);
    setCourseData(prev => ({ ...prev, topics: updatedTopics }));
  };

  const addObjective = () => {
    setCourseData(prev => ({
      ...prev,
      learningObjectives: [...prev.learningObjectives, 'New learning objective']
    }));
  };

  const updateObjective = (index, value) => {
    const updatedObjectives = [...courseData.learningObjectives];
    updatedObjectives[index] = value;
    setCourseData(prev => ({ ...prev, learningObjectives: updatedObjectives }));
  };

  const deleteObjective = (index) => {
    const updatedObjectives = courseData.learningObjectives.filter((_, i) => i !== index);
    setCourseData(prev => ({ ...prev, learningObjectives: updatedObjectives }));
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!courseData) {
    return <div className={styles.loading}>No data available</div>;
  }

  return (
    <>
      <Head>
        <title>Professor Portal - COMP1010</title>
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Professor Portal</h1>
          <div className={styles.headerButtons}>
            <Link href="/" className={styles.linkButton}>View Student Site</Link>
            <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
          </div>
        </header>

        {message && (
          <div className={`${styles.message} ${message.includes('✓') ? styles.success : styles.error}`}>
            {message}
          </div>
        )}

        <div className={styles.content}>
          {/* AI Scope Section */}
          <section className={styles.section}>
            <h2>AI Assistant Scope</h2>
            <textarea
              value={courseData.aiScope}
              onChange={(e) => setCourseData(prev => ({ ...prev, aiScope: e.target.value }))}
              className={styles.textarea}
              rows={5}
              placeholder="Define the AI assistant's behavior and scope..."
            />
          </section>

          {/* Topics Section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Key Topics</h2>
              <button onClick={addTopic} className={styles.addButton}>+ Add Topic</button>
            </div>

            {courseData.topics.map((topic, topicIndex) => (
              <div key={topic.id} className={styles.topicCard}>
                <div className={styles.topicHeader}>
                  <input
                    type="text"
                    value={topic.title}
                    onChange={(e) => updateTopic(topicIndex, 'title', e.target.value)}
                    className={styles.topicInput}
                  />
                  <button onClick={() => deleteTopic(topicIndex)} className={styles.deleteButton}>Delete Topic</button>
                </div>

                <div className={styles.questions}>
                  <div className={styles.questionsHeader}>
                    <strong>Questions:</strong>
                    <button onClick={() => addQuestion(topicIndex)} className={styles.addQuestionButton}>+ Add Question</button>
                  </div>
                  {topic.questions.map((question, questionIndex) => (
                    <div key={questionIndex} className={styles.questionItem}>
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => updateQuestion(topicIndex, questionIndex, e.target.value)}
                        className={styles.questionInput}
                      />
                      <button onClick={() => deleteQuestion(topicIndex, questionIndex)} className={styles.deleteQuestionButton}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* Learning Objectives Section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Learning Objectives</h2>
              <button onClick={addObjective} className={styles.addButton}>+ Add Objective</button>
            </div>

            {courseData.learningObjectives.map((objective, index) => (
              <div key={index} className={styles.objectiveItem}>
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => updateObjective(index, e.target.value)}
                  className={styles.objectiveInput}
                />
                <button onClick={() => deleteObjective(index)} className={styles.deleteQuestionButton}>×</button>
              </div>
            ))}
          </section>

          {/* Upload Slides Section */}
          <section className={styles.section}>
            <h2>Course Slides</h2>
            <p className={styles.currentFile}>Current file: {courseData.slidesFilename}</p>
            <div className={styles.uploadArea}>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                id="fileInput"
                className={styles.fileInput}
                disabled={uploading}
              />
              <label htmlFor="fileInput" className={styles.fileLabel}>
                {uploading ? 'Uploading...' : 'Choose PDF File'}
              </label>
            </div>
          </section>

                    {/* Save Button */}
            <div className={styles.saveContainer}>
            <button 
                onClick={createBackup} 
                className={styles.backupButton}
                type="button"
            >
                Download Backup
            </button>
            <button 
                onClick={handleSave} 
                className={styles.saveButton}
                disabled={saving}
            >
                {saving ? 'Saving...' : 'Save All Changes'}
            </button>
            </div>
        </div>
      </div>
    </>
  );
}

export default ProfessorPortal;