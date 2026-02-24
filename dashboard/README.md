# Sandstone Analytics Dashboard

A comprehensive analytics dashboard for the Sandstone AI-powered learning platform. Track your study progress, visualize performance metrics, earn achievements, and get personalized insights.

## Features

### 📊 Progress Metrics
- **Study Hours Tracking**: Monitor daily, weekly, and monthly study time
- **Essay Statistics**: Track essays graded, average scores, and improvement trends
- **Flashcard Progress**: Review count and retention metrics
- **Quiz Performance**: Completion rates and score tracking

### 📈 Study Statistics Visualizations
- **Study Activity Chart**: Line chart showing hours studied and essays graded over time
- **Skill Radar Chart**: Visualize strengths across different assessment objectives
- **Subject Performance**: Bar charts comparing performance across subjects
- **AO Breakdown**: Assessment Objective scores (AO1-AO4) with progress indicators
- **Progress Over Time**: Track score improvements week by week

### 💡 Insights & Recommendations
- **Improvement Alerts**: Get notified when specific skills improve
- **Study Recommendations**: Personalized tips based on performance data
- **Milestone Celebrations**: Recognition for achieving study streaks
- **Warning Notifications**: Alerts when streaks are at risk

### 📅 Activity Tracking
- **Recent Activity Feed**: Timeline of all study sessions
- **Activity Filtering**: Filter by type (essay, flashcard, quiz, document)
- **Score History**: Track scores for each activity
- **Time-based Grouping**: View activities by day, week, or month

### 🏆 Achievement System
- **16 Unlockable Achievements** across categories:
  - Study streaks (3, 7, 14, 30, 60, 100 days)
  - Essay milestones (1, 10, 50, 100 essays)
  - Flashcard goals (100, 500, 1000 cards)
  - Quiz achievements (10, 25 quizzes)
  - Special achievements (Perfect Score, Knowledge Seeker)
- **Point System**: Earn points for each achievement
- **Progress Tracking**: Visual progress bars for each achievement
- **Unlock Animations**: Celebratory effects when achievements unlock

## File Structure

```
dashboard/
├── page.tsx                    # Main dashboard page (Next.js)
├── layout.tsx                  # Dashboard layout
├── dashboardStore.ts           # Zustand state management
├── dashboard-api.ts            # API integration & local storage
├── index.html                  # Standalone HTML dashboard
├── README.md                   # This file
└── components/
    ├── index.ts                # Component exports
    ├── StatCard.tsx            # Statistics card component
    ├── ActivityFeed.tsx        # Activity timeline component
    ├── AchievementCard.tsx     # Achievement display component
    ├── InsightsPanel.tsx       # Insights & recommendations
    ├── ProgressCharts.tsx      # Chart components
    ├── StudyGoals.tsx          # Study goals tracking
    └── StreakTracker.tsx       # Study streak visualization
```

## Installation

### For Next.js Integration

1. Copy the dashboard folder to your Next.js project:
```bash
cp -r dashboard/ /path/to/your/sandstone/app/dashboard/
```

2. Install required dependencies:
```bash
npm install recharts framer-motion zustand
```

3. Add the dashboard store to your stores folder:
```bash
cp dashboard/dashboardStore.ts /path/to/your/sandstone/stores/
```

4. Update your navigation to include the dashboard link

### Standalone HTML Dashboard

Simply open `index.html` in any modern web browser:
```bash
open dashboard/index.html
```

## Usage

### Main Dashboard Page

The dashboard is organized into tabs:

1. **Overview**: Summary statistics, study activity chart, insights, and subject performance
2. **Progress**: Skill radar chart, progress over time, and weekly goals
3. **Activity**: Recent activity feed with all study sessions
4. **Achievements**: Achievement grid with progress tracking

### State Management

The dashboard uses Zustand for state management with persistence:

```typescript
import { useDashboardStore } from '@/stores/dashboardStore';

function MyComponent() {
  const { stats, addStudySession, addEssayGrade } = useDashboardStore();
  
  // Add a study session
  addStudySession({
    date: new Date().toISOString(),
    duration: 60, // minutes
    subject: 'Economics',
    activityType: 'essay'
  });
  
  return <div>Study Hours: {stats.totalStudyHours}</div>;
}
```

### API Integration

The dashboard can fetch data from GitHub API:

```typescript
import { fetchGitHubRepoStats } from './dashboard-api';

const stats = await fetchGitHubRepoStats('BabySabaXXI', 'sandstone');
```

## Components

### StatCard
Display key metrics with trend indicators:

```tsx
<StatCard
  title="Study Hours"
  value="23.7"
  subtitle="This week"
  icon={Clock}
  trend="up"
  trendValue="+12%"
  color="bg-blue-500"
/>
```

### ActivityFeed
Display recent study activities:

```tsx
<ActivityFeed
  activities={activities}
  maxItems={10}
  onViewAll={() => router.push('/activity')}
/>
```

### AchievementCard
Display achievement with progress:

```tsx
<AchievementCard
  achievement={{
    id: 'essay-master',
    title: 'Essay Master',
    description: 'Grade 50 essays',
    icon: 'FileText',
    progress: 43,
    total: 50,
    unlocked: false
  }}
/>
```

### InsightsPanel
Display personalized insights:

```tsx
<InsightsPanel
  insights={insights}
  onDismiss={(id) => dismissInsight(id)}
  onMarkAsRead={(id) => markAsRead(id)}
/>
```

### ProgressCharts
Various chart components for data visualization:

```tsx
<StudyActivityChart data={weeklyData} />
<SkillRadarChart data={skillData} />
<SubjectPerformanceChart data={subjectData} />
```

### StudyGoals
Track study goals with progress:

```tsx
<StudyGoals
  goals={goals}
  onUpdateProgress={(id, progress) => updateGoal(id, progress)}
/>
```

### StreakTracker
Visualize study streaks:

```tsx
<StreakTracker
  currentStreak={7}
  longestStreak={12}
  lastStudyDate="2024-01-15"
  weeklyData={[true, true, true, true, true, true, false]}
/>
```

## Data Persistence

Dashboard data is persisted to localStorage:

- Study sessions
- Essay grades
- Statistics
- Achievements
- Goals

Data is automatically saved and restored on page reload.

## Customization

### Colors

Update the color scheme in `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    DEFAULT: '#3b82f6',
    dark: '#1d4ed8'
  },
  // ... other colors
}
```

### Achievement Thresholds

Modify achievement requirements in `dashboardStore.ts`:

```typescript
{
  id: 'essay-master',
  requirement: 50, // Change this value
  // ...
}
```

### Chart Options

Customize charts in `ProgressCharts.tsx`:

```typescript
<LineChart data={data}>
  <XAxis dataKey="day" />
  <YAxis domain={[0, 100]} />
  <Tooltip />
  <Line type="monotone" dataKey="score" stroke="#3b82f6" />
</LineChart>
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - Part of the Sandstone project
