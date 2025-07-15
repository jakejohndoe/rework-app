export function formatMemberSince(date: Date): string {
  return `Member since ${date.toLocaleDateString('en-US', { 
    month: 'short', 
    year: 'numeric' 
  })}`
}

export function formatLastActive(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMinutes < 1) {
    return 'Active now'
  } else if (diffMinutes < 60) {
    return `Active ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  } else if (diffHours < 24) {
    return `Active ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  } else if (diffDays < 7) {
    return `Active ${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  } else {
    return `Last active ${date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })}`
  }
}