import { Code2 } from 'lucide-react';

/**
 * Labels the exact SDK method an action on this page triggers. Extends the
 * one-off pattern from the onboarding review step ("This calls
 * client.brandProfile.update()") to every primary action in the app, so
 * there's always a concrete, literal mapping from what's on screen to the
 * SDK call that produced it.
 */
export function SdkCallTag({ method }: { method: string }) {
  return (
    <p className="flex items-center gap-1.5 text-xs text-gray-400 font-mono mt-2">
      <Code2 className="h-3 w-3 flex-shrink-0" />
      <span>
        {method}
      </span>
    </p>
  );
}
