// Mock localStorage for tests
const store: Record<string, string> = {};

const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  get length() { return Object.keys(store).length; },
  key: (i: number) => Object.keys(store)[i] ?? null,
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock BroadcastChannel
class BroadcastChannelMock {
  onmessage: ((e: MessageEvent) => void) | null = null;
  postMessage() {}
  close() {}
}
Object.defineProperty(window, 'BroadcastChannel', { value: BroadcastChannelMock });
