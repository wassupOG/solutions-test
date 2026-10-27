export const DEMO_QUERY = `# Welcome! Run this query to explore my professional profile.
query BusinessCard {
  profile {
    name
    headline
    description
    links { label url }
    skills { name category }
    experience {
      company
      position
      startMonth
      endMonth
      achievements
    }
    projects {
      name
      url
      contribution
      skills { name }
    }
  }
}`;
