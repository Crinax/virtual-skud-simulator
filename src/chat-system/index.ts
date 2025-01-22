import { computed, ref } from 'vue'


type Message = {
  text: string
  type: 'user' | 'system'
}

type Lore = {
  [key: string]: {
    text: string
    options: {
      [key: string]: string
    }
  }
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

  const next = (optionKey: string) => {

    messages.value.push({
      text: LORE[currentState.value].options[optionKey],
      type: 'user',
    })
    messages.value.push({
      text: LORE[optionKey].text,
      type: 'system',
    })
    currentState.value = optionKey
  }

  const options = computed(() => LORE[currentState.value].options)

  return {
    messages,
    options,
    next,
  }
}
