import { PanelSection } from './PanelSection';

export function WeatherSection() {
  return (
    <PanelSection title="Weather">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-bold text-(--foreground) font-mono leading-none">
            28°C
          </p>
          <p className="text-xs text-(--foreground-muted) mt-0.5">
            Partly cloudy
          </p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-[10px] text-(--foreground-subtle)">
            Humidity <span className="font-semibold text-(--foreground)">62%</span>
          </p>
          <p className="text-[10px] text-(--foreground-subtle)">
            Wind <span className="font-semibold text-(--foreground)">14 km/h</span>
          </p>
          <p className="text-[10px] text-(--foreground-subtle)">
            UV Index <span className="font-semibold text-(--foreground)">Moderate</span>
          </p>
        </div>
      </div>
    </PanelSection>
  );
}
