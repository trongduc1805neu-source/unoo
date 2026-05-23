import React, { useEffect, useState } from 'react';

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: number | string;
  className?: string;
  strokeWidth?: number | string;
  [key: string]: any;
}

const svgCache: { [key: string]: string } = {};

export function DynamicIcon({ name, size = 16, className = '', ...props }: { name: string } & IconProps) {
  const [svgContent, setSvgContent] = useState<string | null>(svgCache[name] || null);

  useEffect(() => {
    if (svgCache[name]) {
      setSvgContent(svgCache[name]);
      return;
    }

    fetch(`/icons/${name}.svg`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch icon: ${name}`);
        return res.text();
      })
      .then((text) => {
        svgCache[name] = text;
        setSvgContent(text);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [name]);

  if (!svgContent) {
    return (
      <span
        className={`inline-block ${className}`}
        style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      />
    );
  }

  return (
    <span
      className={`custom-svg-icon inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      {...props}
    />
  );
}

// ─────────────────────────────────────────────
// Navigation & Arrows
// ─────────────────────────────────────────────
export const ArrowLeft    = (props: IconProps) => <DynamicIcon name="arrow-left"            {...props} />;
export const ArrowRight   = (props: IconProps) => <DynamicIcon name="arrow-right"           {...props} />;
export const ChevronLeft  = (props: IconProps) => <DynamicIcon name="chevron-left"          {...props} />;
export const ChevronRight = (props: IconProps) => <DynamicIcon name="chevron-right"         {...props} />;
export const ChevronDown  = (props: IconProps) => <DynamicIcon name="chevron-down"          {...props} />;
export const BoxArrowRight   = (props: IconProps) => <DynamicIcon name="box-arrow-right"    {...props} />;
export const BoxArrowInRight = (props: IconProps) => <DynamicIcon name="box-arrow-in-right" {...props} />;

// ─────────────────────────────────────────────
// Actions & Controls
// ─────────────────────────────────────────────
/** Thêm chi tiêu — plus-circle */
export const Plus         = (props: IconProps) => <DynamicIcon name="plus-circle"           {...props} />;
export const PlusLg       = (props: IconProps) => <DynamicIcon name="plus-lg"               {...props} />;
export const PlusCircleFill = (props: IconProps) => <DynamicIcon name="plus-circle-fill"    {...props} />;
export const Trash2       = (props: IconProps) => <DynamicIcon name="trash"                 {...props} />;
export const Edit2        = (props: IconProps) => <DynamicIcon name="pencil"                {...props} />;
export const PencilSquare = (props: IconProps) => <DynamicIcon name="pencil-square"         {...props} />;
export const Download     = (props: IconProps) => <DynamicIcon name="download"              {...props} />;
export const Scissors     = (props: IconProps) => <DynamicIcon name="scissors"              {...props} />;
export const Search       = (props: IconProps) => <DynamicIcon name="search"                {...props} />;
export const LogOut       = (props: IconProps) => <DynamicIcon name="box-arrow-right"       {...props} />;
export const X            = (props: IconProps) => <DynamicIcon name="x"                     {...props} />;
export const XLg          = (props: IconProps) => <DynamicIcon name="x-lg"                  {...props} />;
export const Loader2      = (props: IconProps) => <DynamicIcon name="arrow-clockwise" className={`animate-spin ${props.className || ''}`} {...props} />;

// ─────────────────────────────────────────────
// Checks & Status
// ─────────────────────────────────────────────
export const Check        = (props: IconProps) => <DynamicIcon name="check"                 {...props} />;
export const CheckLg      = (props: IconProps) => <DynamicIcon name="check-lg"              {...props} />;
/** Quyết toán — check2-all */
export const CheckSquare  = (props: IconProps) => <DynamicIcon name="check2-all"            {...props} />;
export const CheckCircle  = (props: IconProps) => <DynamicIcon name="check-circle"          {...props} />;
// Alias giữ tương thích ngược cho SettleUpScreen và Dashboard
export const CheckCircle2 = CheckCircle;
export const CheckCircleFill = (props: IconProps) => <DynamicIcon name="check-circle-fill"  {...props} />;
export const Check2Circle = (props: IconProps) => <DynamicIcon name="check2-circle"         {...props} />;

// ─────────────────────────────────────────────
// Chat & Messaging
// ─────────────────────────────────────────────
export const ChatDots     = (props: IconProps) => <DynamicIcon name="chat-dots"             {...props} />;
export const ChatDotsFill = (props: IconProps) => <DynamicIcon name="chat-dots-fill"        {...props} />;
export const MessageCircle = (props: IconProps) => <DynamicIcon name="chat"                 {...props} />;
export const MessagesSquare = (props: IconProps) => <DynamicIcon name="chat-square-quote"   {...props} />;
/** Bắt đầu trò chuyện — chat-left-text */
export const MessageSquarePlus = (props: IconProps) => <DynamicIcon name="chat-left-text"   {...props} />;
// MessageSquare trỏ đến cùng icon, giữ alias cho tương thích
export const MessageSquare = MessageSquarePlus;
/** Gửi tin nhắn — send-fill */
export const SendIcon     = (props: IconProps) => <DynamicIcon name="send-fill"             {...props} />;
export const SendFill     = SendIcon;

// ─────────────────────────────────────────────
// People & Users
// ─────────────────────────────────────────────
/** Thành viên — people-fill */
export const People       = (props: IconProps) => <DynamicIcon name="people-fill"           {...props} />;
export const PeopleFill   = People;
export const Users        = People;
export const PersonFill   = (props: IconProps) => <DynamicIcon name="person-fill"           {...props} />;
export const PersonPlusFill = (props: IconProps) => <DynamicIcon name="person-plus-fill"    {...props} />;
export const PersonPlus   = (props: IconProps) => <DynamicIcon name="person-plus"           {...props} />;
export const UserPlus     = PersonPlus;
export const User         = (props: IconProps) => <DynamicIcon name="person"                {...props} />;
export const Contact      = (props: IconProps) => <DynamicIcon name="person-lines-fill"     {...props} />;

// ─────────────────────────────────────────────
// Location & Maps
// ─────────────────────────────────────────────
export const MapPin       = (props: IconProps) => <DynamicIcon name="geo-alt"               {...props} />;
export const GeoAlt       = (props: IconProps) => <DynamicIcon name="geo-alt"               {...props} />;
export const GeoAltFill   = (props: IconProps) => <DynamicIcon name="geo-alt-fill"          {...props} />;
/** Kế hoạch chuyến đi — map */
export const Navigation   = (props: IconProps) => <DynamicIcon name="map"                   {...props} />;

// ─────────────────────────────────────────────
// Time & Calendar
// ─────────────────────────────────────────────
export const Clock        = (props: IconProps) => <DynamicIcon name="clock"                 {...props} />;
/** Lịch sử — clock-history */
export const ClockHistory = (props: IconProps) => <DynamicIcon name="clock-history"         {...props} />;
export const RotateCcw    = (props: IconProps) => <DynamicIcon name="arrow-counterclockwise" {...props} />;
export const Calendar     = (props: IconProps) => <DynamicIcon name="calendar"              {...props} />;
export const Calendar2    = (props: IconProps) => <DynamicIcon name="calendar2"             {...props} />;
export const Calendar2Fill = (props: IconProps) => <DynamicIcon name="calendar2-fill"       {...props} />;
export const CalendarCheck = (props: IconProps) => <DynamicIcon name="calendar-check"       {...props} />;

// ─────────────────────────────────────────────
// Finance & Data
// ─────────────────────────────────────────────
export const DollarSign   = (props: IconProps) => <DynamicIcon name="currency-dollar"       {...props} />;
export const Wallet       = (props: IconProps) => <DynamicIcon name="wallet"                {...props} />;
export const BarChart3    = (props: IconProps) => <DynamicIcon name="bar-chart"             {...props} />;
export const QrCode       = (props: IconProps) => <DynamicIcon name="qr-code"               {...props} />;

// ─────────────────────────────────────────────
// Info & Alerts
// ─────────────────────────────────────────────
export const Info              = (props: IconProps) => <DynamicIcon name="info-circle"              {...props} />;
export const AlertTriangle     = (props: IconProps) => <DynamicIcon name="exclamation-triangle"     {...props} />;
export const ExclamationCircle = (props: IconProps) => <DynamicIcon name="exclamation-circle"       {...props} />;
export const ExclamationCircleFill = (props: IconProps) => <DynamicIcon name="exclamation-circle-fill" {...props} />;
export const Bell              = (props: IconProps) => <DynamicIcon name="bell"                     {...props} />;

// ─────────────────────────────────────────────
// UI & Misc
// ─────────────────────────────────────────────
export const Gear         = (props: IconProps) => <DynamicIcon name="gear"                  {...props} />;
export const ImageIcon    = (props: IconProps) => <DynamicIcon name="image"                 {...props} />;
export const Paperclip    = (props: IconProps) => <DynamicIcon name="paperclip"             {...props} />;
export const EmojiSmile   = (props: IconProps) => <DynamicIcon name="emoji-smile"           {...props} />;
export const Sparkles     = (props: IconProps) => <DynamicIcon name="stars"                 {...props} />;
export const PartyPopper  = (props: IconProps) => <DynamicIcon name="balloon"               {...props} />;
export const ThumbsUp     = (props: IconProps) => <DynamicIcon name="hand-thumbs-up"        {...props} />;
export const Pin          = (props: IconProps) => <DynamicIcon name="pin"                   {...props} />;
export const List         = (props: IconProps) => <DynamicIcon name="list"                  {...props} />;
export const FileText     = (props: IconProps) => <DynamicIcon name="file-text"             {...props} />;
export const Sticky       = (props: IconProps) => <DynamicIcon name="sticky"                {...props} />;
export const FunnelFill   = (props: IconProps) => <DynamicIcon name="funnel-fill"           {...props} />;
export const Funnel       = (props: IconProps) => <DynamicIcon name="funnel"                {...props} />;
export const ThreeDotsVertical = (props: IconProps) => <DynamicIcon name="three-dots-vertical" {...props} />;
export const Sun          = (props: IconProps) => <DynamicIcon name="sun"                   {...props} />;
export const Moon         = (props: IconProps) => <DynamicIcon name="moon"                  {...props} />;
export const Telephone    = (props: IconProps) => <DynamicIcon name="telephone"             {...props} />;
export const CameraVideo  = (props: IconProps) => <DynamicIcon name="camera-video"          {...props} />;
