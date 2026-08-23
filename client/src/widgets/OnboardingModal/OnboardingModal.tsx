import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { LuBell, LuCalendarDays, LuDownload, LuSparkles, LuUsers } from "react-icons/lu";
import type { IconType } from "react-icons";
import "./OnboardingModal.scss";

interface Slide {
  icon: IconType;
  color: string;
  title: string;
  text: string;
}

const SLIDES: Slide[] = [
  {
    icon: LuSparkles,
    color: "#a78bfa",
    title: "Все подписки в одном месте",
    text: "Добавляй сервисы и следи за суммой в месяц и в год — больше ни одно списание не пройдёт незаметно.",
  },
  {
    icon: LuBell,
    color: "#f0a35c",
    title: "Напоминания в Telegram",
    text: "Привяжи Telegram в профиле — бот напомнит о предстоящем списании и сообщит, если платёж просрочен.",
  },
  {
    icon: LuUsers,
    color: "#5cc8f0",
    title: "Сплит с друзьями",
    text: "Дели оплату по @username: каждый видит свою долю во вкладке «Друзья», а бот напомнит о переводе.",
  },
  {
    icon: LuCalendarDays,
    color: "#8fe3b0",
    title: "Календарь и аналитика",
    text: "Иконка календаря в шапке покажет списания на любой месяц, а «Аналитика» — куда уходят деньги.",
  },
  {
    icon: LuDownload,
    color: "#f472b6",
    title: "Установи на экран «Домой»",
    text: "Приложение можно установить как обычное — кнопка есть в профиле. И оно работает без интернета: всё сохранится и досинхронизируется при появлении сети.",
  },
];

interface OnboardingModalProps {
  onClose: () => void;
}

export function OnboardingModal({ onClose }: OnboardingModalProps) {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(false);
  const [enterDir, setEnterDir] = useState<"next" | "prev" | null>(null);
  const [dragX, setDragX] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipingRef = useRef(false);

  const slide = SLIDES[index];
  const Icon = slide.icon;
  const isLast = index === SLIDES.length - 1;

  useEffect(() => {
    let cancelled = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) setShown(true);
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const finish = useCallback(() => {
    setShown(false);
    window.setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [finish]);

  const goTo = (next: number) => {
    if (next < 0 || next >= SLIDES.length || next === index) return;
    setEnterDir(next > index ? "next" : "prev");
    setIndex(next);
    setDragX(0);
  };

  const onTouchStart = (event: React.TouchEvent) => {
    touchStartRef.current = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
    swipingRef.current = false;
  };

  const onTouchMove = (event: React.TouchEvent) => {
    const start = touchStartRef.current;
    if (!start) return;
    const dx = event.touches[0].clientX - start.x;
    const dy = event.touches[0].clientY - start.y;
    if (!swipingRef.current) {
      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy))
        swipingRef.current = true;
      else if (Math.abs(dy) > 12) touchStartRef.current = null;
    }
    if (swipingRef.current) setDragX(dx);
  };

  const onTouchEnd = () => {
    const dx = dragX;
    setDragX(0);
    touchStartRef.current = null;
    swipingRef.current = false;
    if (dx <= -70) goTo(index + 1);
    else if (dx >= 70) goTo(index - 1);
  };

  const slideClass = [
    "onboarding__slide",
    enterDir === "next" ? "onboarding__slide--enter-next" : "",
    enterDir === "prev" ? "onboarding__slide--enter-prev" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div
        className={`onboarding__backdrop ${shown ? "onboarding__backdrop--open" : ""}`}
        onClick={finish}
      ></div>
      <div className={`onboarding ${shown ? "onboarding--open" : ""}`}>
        <button className="onboarding__skip" onClick={finish}>
          Пропустить
        </button>
        <div
          key={index}
          className={slideClass}
          style={
            dragX !== 0
              ? {
                  transform: `translateX(${dragX * 0.55}px)`,
                  transition: "none",
                  animation: "none",
                }
              : undefined
          }
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="onboarding__illustration"
            style={{ "--oc": slide.color } as CSSProperties}
          >
            <Icon size={44} />
          </div>
          <div className="onboarding__title">{slide.title}</div>
          <div className="onboarding__text">{slide.text}</div>
        </div>
        <div className="onboarding__dots">
          {SLIDES.map((_, dotIndex) => (
            <span
              key={dotIndex}
              className={`onboarding__dot ${dotIndex === index ? "onboarding__dot--active" : ""}`}
              onClick={() => goTo(dotIndex)}
            ></span>
          ))}
        </div>
        <button
          className="onboarding__next"
          onClick={() => (isLast ? finish() : goTo(index + 1))}
        >
          {isLast ? "Погнали" : "Далее"}
        </button>
      </div>
    </>
  );
}
