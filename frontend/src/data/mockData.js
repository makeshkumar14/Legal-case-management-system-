// ============================================
// MOCK DATA FOR LEGAL CASE MANAGEMENT SYSTEM
// ============================================

// Users
export const users = {
  public: {
    id: 'PUB001',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@gmail.com',
    role: 'public',
    citizenId: 'AADHAAR-1234-5678-9012',
    avatar: null,
  },
  advocate: {
    id: 'ADV001',
    name: 'Adv. Priya Sharma',
    email: 'priya.sharma@lawfirm.in',
    role: 'advocate',
    barCouncilId: 'BCI/MAH/2015/12345',
    specialization: 'Civil Law',
    avatar: null,
  },
  court: {
    id: 'CRT001',
    name: 'Hon. Justice Ramachandra',
    email: 'court.admin@judiciary.gov.in',
    role: 'court',
    courtName: 'Chennai High Court',
    avatar: null,
  },
};

// Case Statuses
export const caseStatuses = [
  { id: 'filed', label: 'Filed', color: 'info' },
  { id: 'under_review', label: 'Under Review', color: 'warning' },
  { id: 'hearing_scheduled', label: 'Hearing Scheduled', color: 'indigo' },
  { id: 'in_progress', label: 'In Progress', color: 'gold' },
  { id: 'judgment_reserved', label: 'Judgment Reserved', color: 'warning' },
  { id: 'closed', label: 'Closed', color: 'success' },
  { id: 'dismissed', label: 'Dismissed', color: 'error' },
];

// Cases
export const cases = [
  {
    id: 'CASE-2024-001',
    title: 'Property Dispute - Land Registration',
    description: 'Dispute regarding ownership of agricultural land in Kanchipuram district. Plaintiff claims ancestral property rights.',
    caseNumber: 'CS/2024/0012',
    caseType: 'Civil',
    filingDate: '2024-01-15',
    status: 'hearing_scheduled',
    priority: 'high',
    petitioner: 'Suresh Babu',
    respondent: 'Tamil Nadu Land Authority',
    advocate: users.advocate,
    judge: 'Hon. Justice Venkataraman',
    courtRoom: 'Court Room 5',
    nextHearing: '2024-02-15T10:30:00',
    hearings: [
      { date: '2024-01-20', type: 'First Hearing', status: 'completed', notes: 'Case admitted, next date fixed.' },
      { date: '2024-02-01', type: 'Arguments', status: 'completed', notes: 'Petitioner arguments heard.' },
      { date: '2024-02-15', type: 'Counter Arguments', status: 'scheduled', notes: '' },
    ],
    timeline: [
      { date: '2024-01-15', event: 'Case Filed', description: 'Case registered with Court Registry' },
      { date: '2024-01-17', event: 'Advocate Assigned', description: 'Adv. Priya Sharma assigned as counsel' },
      { date: '2024-01-20', event: 'First Hearing', description: 'Case admitted for hearing' },
      { date: '2024-02-01', event: 'Arguments Presented', description: 'Petitioner side arguments completed' },
    ],
  },
  {
    id: 'CASE-2024-002',
    title: 'Consumer Complaint - Defective Vehicle',
    description: 'Consumer complaint regarding manufacturing defect in purchased vehicle. Seeking compensation and replacement.',
    caseNumber: 'CC/2024/0045',
    caseType: 'Consumer',
    filingDate: '2024-01-22',
    status: 'under_review',
    priority: 'medium',
    petitioner: 'Anand Krishnan',
    respondent: 'AutoMakers India Pvt Ltd',
    advocate: users.advocate,
    judge: 'Hon. Justice Lakshmi',
    courtRoom: 'Consumer Forum Hall 2',
    nextHearing: '2024-02-20T14:00:00',
    hearings: [
      { date: '2024-01-25', type: 'Preliminary Hearing', status: 'completed', notes: 'Documents verified.' },
    ],
    timeline: [
      { date: '2024-01-22', event: 'Complaint Filed', description: 'Consumer complaint registered' },
      { date: '2024-01-25', event: 'Documents Verified', description: 'All supporting documents accepted' },
    ],
  },
  {
    id: 'CASE-2024-003',
    title: 'Family Settlement - Inheritance Dispute',
    description: 'Dispute among siblings regarding distribution of inherited property after demise of parents.',
    caseNumber: 'FS/2024/0008',
    caseType: 'Family',
    filingDate: '2024-02-01',
    status: 'filed',
    priority: 'low',
    petitioner: 'Meena Devi',
    respondent: 'Rajan & Others',
    advocate: users.advocate,
    judge: 'Pending Assignment',
    courtRoom: 'TBD',
    nextHearing: null,
    hearings: [],
    timeline: [
      { date: '2024-02-01', event: 'Case Filed', description: 'Family settlement petition filed' },
    ],
  },
  {
    id: 'CASE-2024-004',
    title: 'Criminal Appeal - Theft Case',
    description: 'Appeal against conviction in theft case. Appellant claiming wrongful conviction based on circumstantial evidence.',
    caseNumber: 'CRA/2024/0102',
    caseType: 'Criminal',
    filingDate: '2023-11-15',
    status: 'in_progress',
    priority: 'high',
    petitioner: 'State of Tamil Nadu',
    respondent: 'Vijay Kumar (Appellant)',
    advocate: users.advocate,
    judge: 'Hon. Justice Sundaram',
    courtRoom: 'Court Room 12',
    nextHearing: '2024-02-10T11:00:00',
    hearings: [
      { date: '2023-11-20', type: 'Admission Hearing', status: 'completed', notes: 'Appeal admitted.' },
      { date: '2023-12-15', type: 'Document Submission', status: 'completed', notes: 'All evidence submitted.' },
      { date: '2024-01-25', type: 'Witness Examination', status: 'completed', notes: 'Key witnesses examined.' },
      { date: '2024-02-10', type: 'Final Arguments', status: 'scheduled', notes: '' },
    ],
    timeline: [
      { date: '2023-11-15', event: 'Appeal Filed', description: 'Criminal appeal filed against lower court judgment' },
      { date: '2023-11-20', event: 'Appeal Admitted', description: 'High Court admits the appeal' },
      { date: '2023-12-15', event: 'Documents Submitted', description: 'All case documents and evidence filed' },
      { date: '2024-01-25', event: 'Witnesses Examined', description: 'Cross-examination of witnesses completed' },
    ],
  },
  {
    id: 'CASE-2024-005',
    title: 'Writ Petition - Environmental Clearance',
    description: 'Public interest litigation challenging environmental clearance granted to industrial project near protected forest.',
    caseNumber: 'WP/2024/0234',
    caseType: 'Writ',
    filingDate: '2024-01-10',
    status: 'judgment_reserved',
    priority: 'high',
    petitioner: 'Green Earth Foundation',
    respondent: 'Ministry of Environment & Forest',
    advocate: users.advocate,
    judge: 'Hon. Chief Justice',
    courtRoom: 'Principal Bench',
    nextHearing: null,
    hearings: [
      { date: '2024-01-12', type: 'Urgent Mention', status: 'completed', notes: 'Interim stay granted.' },
      { date: '2024-01-18', type: 'Full Hearing', status: 'completed', notes: 'Both parties heard.' },
      { date: '2024-01-25', type: 'Final Arguments', status: 'completed', notes: 'Judgment reserved.' },
    ],
    timeline: [
      { date: '2024-01-10', event: 'PIL Filed', description: 'Public interest litigation filed' },
      { date: '2024-01-12', event: 'Interim Stay', description: 'Stay on project construction' },
      { date: '2024-01-18', event: 'Arguments Heard', description: 'Full bench hearing conducted' },
      { date: '2024-01-25', event: 'Judgment Reserved', description: 'Order reserved for pronouncement' },
    ],
  },
  {
    id: 'CASE-2023-089',
    title: 'Motor Accident Claim',
    description: 'Claim for compensation arising from road traffic accident causing grievous injuries.',
    caseNumber: 'MAC/2023/0567',
    caseType: 'Motor Accident',
    filingDate: '2023-08-20',
    status: 'closed',
    priority: 'medium',
    petitioner: 'Lakshmi Narayan',
    respondent: 'United India Insurance',
    advocate: users.advocate,
    judge: 'Hon. Justice Balaji',
    courtRoom: 'MACT Hall',
    nextHearing: null,
    hearings: [
      { date: '2023-09-15', type: 'First Hearing', status: 'completed', notes: 'Claim petition admitted.' },
      { date: '2023-10-20', type: 'Evidence', status: 'completed', notes: 'Medical records submitted.' },
      { date: '2023-11-25', type: 'Arguments', status: 'completed', notes: 'Both sides argued.' },
      { date: '2023-12-15', type: 'Judgment', status: 'completed', notes: 'Compensation of ₹5,00,000 awarded.' },
    ],
    timeline: [
      { date: '2023-08-20', event: 'Claim Filed', description: 'Motor accident claim petition filed' },
      { date: '2023-09-15', event: 'Claim Admitted', description: 'MACT accepts the claim' },
      { date: '2023-12-15', event: 'Judgment Delivered', description: 'Compensation awarded to claimant' },
      { date: '2023-12-20', event: 'Case Closed', description: 'Case disposed of' },
    ],
  },
];

// Evidence Records
export const evidences = [
  {
    id: 'EVD-001',
    caseId: 'CASE-2024-001',
    title: 'Original Sale Deed - 1985',
    type: 'Document',
    fileType: 'pdf',
    uploadedBy: 'Adv. Priya Sharma',
    uploadedAt: '2024-01-16T10:30:00',
    size: '2.4 MB',
    verified: true,
  },
  {
    id: 'EVD-002',
    caseId: 'CASE-2024-001',
    title: 'Survey Map',
    type: 'Document',
    fileType: 'pdf',
    uploadedBy: 'Adv. Priya Sharma',
    uploadedAt: '2024-01-16T11:00:00',
    size: '1.8 MB',
    verified: true,
  },
  {
    id: 'EVD-003',
    caseId: 'CASE-2024-001',
    title: 'Photograph - Disputed Land',
    type: 'Image',
    fileType: 'jpg',
    uploadedBy: 'Adv. Priya Sharma',
    uploadedAt: '2024-01-17T09:15:00',
    size: '3.2 MB',
    verified: false,
  },
  {
    id: 'EVD-004',
    caseId: 'CASE-2024-002',
    title: 'Vehicle Purchase Invoice',
    type: 'Document',
    fileType: 'pdf',
    uploadedBy: 'Adv. Priya Sharma',
    uploadedAt: '2024-01-23T14:00:00',
    size: '0.8 MB',
    verified: true,
  },
  {
    id: 'EVD-005',
    caseId: 'CASE-2024-002',
    title: 'Service Center Report',
    type: 'Document',
    fileType: 'pdf',
    uploadedBy: 'Adv. Priya Sharma',
    uploadedAt: '2024-01-23T14:30:00',
    size: '1.2 MB',
    verified: true,
  },
  {
    id: 'EVD-006',
    caseId: 'CASE-2024-004',
    title: 'CCTV Footage Analysis',
    type: 'Video',
    fileType: 'mp4',
    uploadedBy: 'Court Registry',
    uploadedAt: '2023-12-01T16:00:00',
    size: '45.8 MB',
    verified: true,
  },
];

// Advocates List (for Court Admin)
export const advocates = [
  {
    id: 'ADV001',
    name: 'Adv. Priya Sharma',
    barCouncilId: 'BCI/MAH/2015/12345',
    specialization: 'Civil Law',
    experience: '9 years',
    email: 'priya.sharma@lawfirm.in',
    phone: '+91 98765 43210',
    activeCases: 5,
    rating: 4.8,
  },
  {
    id: 'ADV002',
    name: 'Adv. Subramaniam K',
    barCouncilId: 'BCI/TN/2010/08765',
    specialization: 'Criminal Law',
    experience: '14 years',
    email: 'subra.k@legalaid.in',
    phone: '+91 87654 32109',
    activeCases: 8,
    rating: 4.9,
  },
  {
    id: 'ADV003',
    name: 'Adv. Fatima Begum',
    barCouncilId: 'BCI/KA/2018/04321',
    specialization: 'Family Law',
    experience: '6 years',
    email: 'fatima.law@gmail.com',
    phone: '+91 76543 21098',
    activeCases: 3,
    rating: 4.7,
  },
  {
    id: 'ADV004',
    name: 'Adv. Rajendra Prasad',
    barCouncilId: 'BCI/TN/2005/02345',
    specialization: 'Constitutional Law',
    experience: '19 years',
    email: 'raj.prasad@supremelaw.in',
    phone: '+91 65432 10987',
    activeCases: 12,
    rating: 4.95,
  },
];

// Notifications
export const notifications = [
  {
    id: 'NOT-001',
    type: 'hearing',
    title: 'Upcoming Hearing Tomorrow',
    message: 'Case CS/2024/0012 hearing scheduled for tomorrow at 10:30 AM in Court Room 5.',
    timestamp: '2024-02-14T09:00:00',
    read: false,
    priority: 'high',
  },
  {
    id: 'NOT-002',
    type: 'update',
    title: 'Case Status Updated',
    message: 'Case WP/2024/0234 status changed to Judgment Reserved.',
    timestamp: '2024-02-13T16:30:00',
    read: false,
    priority: 'medium',
  },
  {
    id: 'NOT-003',
    type: 'document',
    title: 'New Document Uploaded',
    message: 'New evidence document uploaded for Case CRA/2024/0102.',
    timestamp: '2024-02-12T11:15:00',
    read: true,
    priority: 'low',
  },
  {
    id: 'NOT-004',
    type: 'reminder',
    title: 'Document Submission Deadline',
    message: 'Reminder: Submit rejoinder for Case CC/2024/0045 by Feb 18.',
    timestamp: '2024-02-11T08:00:00',
    read: true,
    priority: 'medium',
  },
  {
    id: 'NOT-005',
    type: 'system',
    title: 'System Maintenance',
    message: 'Scheduled maintenance on Feb 20, 2024 from 2 AM to 6 AM.',
    timestamp: '2024-02-10T10:00:00',
    read: true,
    priority: 'low',
  },
];

// Calendar Events (for Advocate)
export const calendarEvents = [
  {
    id: 'EVT-001',
    title: 'Property Case Hearing',
    start: '2024-02-15T10:30:00',
    end: '2024-02-15T12:00:00',
    type: 'hearing',
    caseId: 'CASE-2024-001',
    location: 'Court Room 5',
  },
  {
    id: 'EVT-002',
    title: 'Consumer Case Hearing',
    start: '2024-02-20T14:00:00',
    end: '2024-02-20T15:30:00',
    type: 'hearing',
    caseId: 'CASE-2024-002',
    location: 'Consumer Forum Hall 2',
  },
  {
    id: 'EVT-003',
    title: 'Client Meeting - Meena Devi',
    start: '2024-02-12T11:00:00',
    end: '2024-02-12T12:00:00',
    type: 'meeting',
    caseId: 'CASE-2024-003',
    location: 'Office',
  },
  {
    id: 'EVT-004',
    title: 'Final Arguments Preparation',
    start: '2024-02-09T09:00:00',
    end: '2024-02-09T17:00:00',
    type: 'deadline',
    caseId: 'CASE-2024-004',
    location: 'Office',
  },
  {
    id: 'EVT-005',
    title: 'Evidence Submission Deadline',
    start: '2024-02-18T23:59:00',
    end: '2024-02-18T23:59:00',
    type: 'deadline',
    caseId: 'CASE-2024-002',
    location: null,
  },
];

// Case Notes (for Advocate)
export const caseNotes = [
  {
    id: 'NOTE-001',
    caseId: 'CASE-2024-001',
    content: 'Reviewed original sale deed. Need to verify chain of ownership from 1975.',
    createdAt: '2024-01-16T14:30:00',
    updatedAt: '2024-01-16T14:30:00',
  },
  {
    id: 'NOTE-002',
    caseId: 'CASE-2024-001',
    content: 'Met with client. He has additional documents from village records office.',
    createdAt: '2024-01-18T10:00:00',
    updatedAt: '2024-01-18T10:00:00',
  },
  {
    id: 'NOTE-003',
    caseId: 'CASE-2024-002',
    content: 'Expert witness identified - automobile engineer from IIT Madras.',
    createdAt: '2024-01-24T11:00:00',
    updatedAt: '2024-01-24T11:00:00',
  },
];

// Task Checklist (for Advocate)
export const tasks = [
  {
    id: 'TASK-001',
    caseId: 'CASE-2024-001',
    title: 'Collect village records',
    completed: true,
    priority: 'high',
    dueDate: '2024-01-25',
  },
  {
    id: 'TASK-002',
    caseId: 'CASE-2024-001',
    title: 'Prepare counter arguments',
    completed: false,
    priority: 'high',
    dueDate: '2024-02-14',
  },
  {
    id: 'TASK-003',
    caseId: 'CASE-2024-002',
    title: 'Get expert opinion on vehicle defect',
    completed: false,
    priority: 'medium',
    dueDate: '2024-02-18',
  },
  {
    id: 'TASK-004',
    caseId: 'CASE-2024-003',
    title: 'Draft settlement proposal',
    completed: false,
    priority: 'low',
    dueDate: '2024-02-28',
  },
  {
    id: 'TASK-005',
    caseId: 'CASE-2024-004',
    title: 'Prepare final arguments brief',
    completed: false,
    priority: 'high',
    dueDate: '2024-02-09',
  },
];

// Analytics Data (for Court Admin)
export const analyticsData = {
  totalCases: 156,
  pendingCases: 89,
  closedCases: 52,
  dismissedCases: 15,
  todayHearings: 12,
  thisWeekHearings: 45,
  avgCaseDuration: '4.5 months',
  casesByType: [
    { name: 'Civil', value: 45, color: '#4f46e5' },
    { name: 'Criminal', value: 35, color: '#ef4444' },
    { name: 'Family', value: 25, color: '#f59e0b' },
    { name: 'Consumer', value: 20, color: '#10b981' },
    { name: 'Writ', value: 18, color: '#8b5cf6' },
    { name: 'Others', value: 13, color: '#64748b' },
  ],
  casesTrend: [
    { month: 'Aug', filed: 12, closed: 8 },
    { month: 'Sep', filed: 18, closed: 10 },
    { month: 'Oct', filed: 15, closed: 12 },
    { month: 'Nov', filed: 22, closed: 14 },
    { month: 'Dec', filed: 20, closed: 18 },
    { month: 'Jan', filed: 25, closed: 15 },
    { month: 'Feb', filed: 8, closed: 5 },
  ],
  dailyHearings: [
    { day: 'Mon', count: 15 },
    { day: 'Tue', count: 12 },
    { day: 'Wed', count: 18 },
    { day: 'Thu', count: 14 },
    { day: 'Fri', count: 10 },
    { day: 'Sat', count: 5 },
  ],
};

// Get case by ID helper
export const getCaseById = (id) => cases.find(c => c.id === id);

// Get cases by status helper
export const getCasesByStatus = (status) => cases.filter(c => c.status === status);

// Get evidence for case helper  
export const getEvidenceForCase = (caseId) => evidences.filter(e => e.caseId === caseId);

// Get upcoming hearings helper
export const getUpcomingHearings = () => {
  const now = new Date();
  return cases
    .filter(c => c.nextHearing && new Date(c.nextHearing) > now)
    .sort((a, b) => new Date(a.nextHearing) - new Date(b.nextHearing));
};
