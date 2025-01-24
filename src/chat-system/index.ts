import { computed, ref } from 'vue'

type Message = {
  text: string
  type: 'user' | 'system'
}

type LoreOption = {
  id: string
  text: string
  goto: string
}

type LoreState = {
  text: string
  options: LoreOption[]
  questions?: TestQuestion[]
}

type Lore = {
  [key: string]: LoreState
}

import lore from './lore.json'

const LORE = lore as Lore

type TestQuestion = {
  question: string
  answers: { id: string; text: string; isCorrect: boolean }[]
}

export const useChat = () => {
  const currentState = ref<string>('idle')
  const messages = ref<Message[]>([
    {
      text: LORE[currentState.value].text,
      type: 'system',
    },
  ])
  const answers = computed(() => {
    return LORE[currentState.value].questions?.flatMap((q) => q.answers).map((a) => a.id) ?? []
  })

  const isStateTest = (state: string) => {
    return (
      (LORE[state] && LORE[state].questions && LORE[state].questions.length > 0) ||
      (answers.value.includes(state) && answers.value.length > 0)
    )
  }

  const next = (optionId: string) => {
    const currentOptions = LORE[currentState.value].options
    const selectedOption = currentOptions.find((opt) => opt.id === optionId)

    if (!selectedOption) return

    messages.value.push({
      text: selectedOption.text,
      type: 'user',
    })

    const nextState = selectedOption.goto
    messages.value.push({
      text: LORE[nextState].text,
      type: 'system',
    })

    if (LORE[nextState].questions) {
      const firstQuestion = LORE[nextState].questions[0]
      messages.value.push({
        text: firstQuestion.question,
        type: 'system',
      })
    }

    currentState.value = nextState
  }

  const options = computed(() => {
    const currentOptions = LORE[currentState.value].options
    const filteredOptions: Record<string, string> = {}

    for (const option of currentOptions) {
      filteredOptions[option.id] = option.text
    }

    return filteredOptions
  })

  // Проверяем наличие вопросов в текущем состоянии
  const testQuestions = computed(() => {
    return LORE[currentState.value].questions || []
  })

  return {
    messages,
    options,
    next,
    isStateTest,
    testQuestions,
  }
}
