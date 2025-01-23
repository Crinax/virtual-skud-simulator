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
}

type Lore = {
  [key: string]: LoreState
}

import lore from './lore.json'

const LORE = lore as Lore

export const useChat = () => {
  const currentState = ref<string>('idle')
  const messages = ref<Message[]>([
    {
      text: LORE[currentState.value].text,
      type: 'system',
    },
  ])

  const next = (optionId: string) => {
    const currentOptions = LORE[currentState.value].options
    const selectedOption = currentOptions.find(opt => opt.id === optionId)

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

  return {
    messages,
    options,
    next,
  }
}
