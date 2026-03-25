"use client";

import { useState } from "react";

export type ServiceDataPoint = { label: string; value: number; color: string; amount: number; count?: number };
const cx = 90;
const cy = 90;
const R = 68;
const innerR = 46;

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number
) {
  const o1 = polarToXY(cx, cy, outerR, startAngle);
  const o2 = polarToXY(cx, cy, outerR, endAngle);
  const i1 = polarToXY(cx, cy, innerR, endAngle);
  const i2 = polarToXY(cx, cy, innerR, startAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${i2.x} ${i2.y}`,
    "Z",
  ].join(" ");
}

export function ServiceDonut({ services, total }: { services: ServiceDataPoint[]; total: number }) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (services.length === 0) {
    return (
      <div className="flex items-center justify-center h-[180px] text-xs text-[var(--mh-text-subtle)]">
        No service data yet
      </div>
    );
  }

  let cumulative = 0;
  const segments = services.map((s, i) => {
    const startAngle = cumulative;
    const sweep = (s.value / 100) * 360;
    cumulative += sweep;
    return { ...s, startAngle, endAngle: startAngle + sweep, index: i };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg
          width={180}
          height={180}
          viewBox={`0 0 ${cx * 2} ${cy * 2}`}
          className="overflow-visible"
        >
          {/* Gap ring */}
          <circle cx={cx} cy={cy} r={R + 4} fill="none" stroke="#1E1E1E" strokeWidth="3" />

          {segments.map((seg) => {
            const isHov = hovered === seg.index;
            const outerR = isHov ? R + 5 : R;
            const path = arcPath(cx, cy, outerR, innerR, seg.startAngle, seg.endAngle);

            return (
              <path
                key={seg.index}
                d={path}
                fill={seg.color}
                opacity={isHov ? 1 : 0.88}
                onMouseEnter={() => setHovered(seg.index)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer", transition: "all 0.2s ease" }}
              />
            );
          })}

          {/* Center text */}
          <text
            x={cx}
            y={cy - 9}
            textAnchor="middle"
            fontSize="8.5"
            fill="#555555"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Revenue Total
          </text>
          <text
            x={cx}
            y={cy + 11}
            textAnchor="middle"
            fontSize="15"
            fontWeight="700"
            fill="#D4D4D4"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            ${(total / 1000).toFixed(1)}K
          </text>

          {/* Hover tooltip in center */}
          {hovered !== null && (
            <>
              <text
                x={cx}
                y={cy - 9}
                textAnchor="middle"
                fontSize="8"
                fill={services[hovered].color}
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {services[hovered].label}
              </text>
              <text
                x={cx}
                y={cy + 11}
                textAnchor="middle"
                fontSize="14"
                fontWeight="700"
                fill="#D4D4D4"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                ${services[hovered].amount.toLocaleString()}
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 w-full px-2">
        {services.map((s, i) => (
          <div
            key={s.label}
            className="flex items-center gap-2 cursor-pointer"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: s.color, opacity: hovered === i ? 1 : 0.8 }}
            />
            <span
              className="text-[11px] text-[var(--mh-text-subtle)] leading-tight"
              style={{
                color: hovered === i ? "#D4D4D4" : undefined,
              }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
