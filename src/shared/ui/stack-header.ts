import { Platform } from 'react-native';
import { isGlassSurfaceAvailable } from './glass-surface';
import { stackHeaderOptions, type StackHeaderLook } from './navigation';

function currentLook(): StackHeaderLook {
  if (Platform.OS === 'ios') {
    return isGlassSurfaceAvailable() ? 'liquidGlass' : 'blur';
  }
  if (Platform.OS === 'android') return 'blur';
  return 'solid';
}

const headerLook = currentLook();

/**
 * True when the stack header floats over the screen (liquid glass or frosted blur)
 * so content can scroll beneath it.
 */
export const hasFloatingHeader = headerLook !== 'solid';

/**
 * True when iOS itself offsets scroll content below the header via
 * `contentInsetAdjustmentBehavior="automatic"`. Android needs `useHeaderInset` instead.
 */
export const systemAdjustsHeaderInset = Platform.OS === 'ios' && hasFloatingHeader;

export const defaultStackHeaderOptions = stackHeaderOptions(headerLook);
