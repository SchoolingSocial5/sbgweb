export interface Input {
  name: string
  value: string | number | null | File | Date | boolean
  rules: ValidationRules
  field: string
}

export interface ValidationRules {
  type?: 'image' | 'audio' | 'video' | 'doc'
  blank?: boolean
  minLength?: number
  maxLength?: number
  maxSize?: number
  maxTime?: number
  zero?: boolean
}

const fileTypeMapping: Record<string, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  audio: ['audio/mpeg', 'audio/mp3'],
  video: ['video/mp4', 'video/webm', 'video/ogg'],
  doc: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
}

type ValidationResult = {
  valid: boolean
  messages: Record<string, string>
}

const validateFile = (
  name: string,
  file: File,
  rules: ValidationRules,
  field: string
): string | null => {
  // Validate file type
  if (rules.type && fileTypeMapping[rules.type]) {
    if (!fileTypeMapping[rules.type].includes(file.type)) {
      return `${field} must be a valid ${rules.type} file.`
    }
  }

  // Validate max size
  if (rules.maxSize && file.size > rules.maxSize * 1024 * 1024) {
    return `${field} must not exceed ${rules.maxSize} MB.`
  }

  // Validate video duration (synchronously for simplicity)
  if (rules.maxTime && file.type.startsWith('video/')) {
    const video = document.createElement('video')
    const url = URL.createObjectURL(file)

    video.src = url
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      if (video.duration / 60 > rules.maxTime!) {
        return `${field} must not exceed ${rules.maxTime} minutes.`
      }
    }
  }

  return null
}

export const validateInputs = (inputs: Input[]): ValidationResult => {
  const messages: Record<string, string> = {}

  for (const input of inputs) {
    const { name, value, rules, field } = input

    // If value is a file, validate it
    if (value instanceof File) {
      const fileValidationMessage = validateFile(name, value, rules, field)
      if (fileValidationMessage) {
        messages[name] = fileValidationMessage
        continue // Skip further rules for this file input
      }
    }

    // Rule: Blank
    if (
      rules.blank &&
      (!value || (typeof value === 'string' && value.trim() === ''))
    ) {
      messages[name] = `${field} cannot be blank.`
      continue // Skip further rules for this field
    }

    if (rules.zero && value === 0) {
      messages[name] = `${field} cannot be zero.`
      continue // Skip further rules for this field
    }

    // Rule: minLength
    if (
      rules.minLength &&
      typeof value === 'string' &&
      value.length < rules.minLength
    ) {
      messages[
        name
      ] = `${field} must be at least ${rules.minLength} characters long.`
      continue
    }

    // Rule: maxLength
    if (
      rules.maxLength &&
      typeof value === 'string' &&
      value.length > rules.maxLength
    ) {
      messages[name] = `${field} must not exceed ${rules.maxLength} characters.`
      continue
    }
  }

  return {
    valid: Object.keys(messages).length === 0,
    messages,
  }
}
