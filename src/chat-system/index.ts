import { computed, ref } from 'vue'

type Message = {
  text: string
  type: 'user' | 'system'
}

type LoreOption = {
  id: string
  text: string
  goto: string
  always: boolean
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
  const usedOptions = ref<Set<string>>(new Set())
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

    usedOptions.value.add(optionId)

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
      if (option.id.startsWith('always_') || !usedOptions.value.has(option.id)) {
        filteredOptions[option.id] = option.text
      }
    }

    return filteredOptions
  })

  const shouldShowOption = (optionId: string) => {
    const option = LORE[currentState.value].options.find(opt => opt.id === optionId)
    if (!option) return false
    return option.always || !usedOptions.value.has(optionId)
  }

  return {
    messages,
    options,
    next,
    shouldShowOption,
  }
}
