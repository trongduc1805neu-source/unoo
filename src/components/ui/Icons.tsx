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

// Original Exports mappings
export const ArrowLeft = (props: IconProps) => <DynamicIcon name="arrow-left" {...props} />;
export const Bell = (props: IconProps) => <DynamicIcon name="bell" {...props} />;
export const BoxArrowRight = (props: IconProps) => <DynamicIcon name="box-arrow-right" {...props} />;
export const BoxArrowInRight = (props: IconProps) => <DynamicIcon name="box-arrow-in-right" {...props} />;
export const CameraVideo = (props: IconProps) => <DynamicIcon name="camera-video" {...props} />;
export const ChatDotsFill = (props: IconProps) => <DynamicIcon name="chat-dots-fill" {...props} />;
export const ChatDots = (props: IconProps) => <DynamicIcon name="chat-dots" {...props} />;
export const CheckCircleFill = (props: IconProps) => <DynamicIcon name="check-circle-fill" {...props} />;
export const CheckCircle = (props: IconProps) => <DynamicIcon name="check-circle" {...props} />;
export const CheckLg = (props: IconProps) => <DynamicIcon name="check-lg" {...props} />;
export const Check2Circle = (props: IconProps) => <DynamicIcon name="check2-circle" {...props} />;
export const ChevronDown = (props: IconProps) => <DynamicIcon name="chevron-down" {...props} />;
export const ClockHistory = (props: IconProps) => <DynamicIcon name="clock-history" {...props} />;
export const EmojiSmile = (props: IconProps) => <DynamicIcon name="emoji-smile" {...props} />;
export const FunnelFill = (props: IconProps) => <DynamicIcon name="funnel-fill" {...props} />;
export const Funnel = (props: IconProps) => <DynamicIcon name="funnel" {...props} />;
export const Gear = (props: IconProps) => <DynamicIcon name="gear" {...props} />;
export const GeoAltFill = (props: IconProps) => <DynamicIcon name="geo-alt-fill" {...props} />;
export const GeoAlt = (props: IconProps) => <DynamicIcon name="geo-alt" {...props} />;
export const ImageIcon = (props: IconProps) => <DynamicIcon name="image" {...props} />;
export const Paperclip = (props: IconProps) => <DynamicIcon name="paperclip" {...props} />;
export const PencilSquare = (props: IconProps) => <DynamicIcon name="pencil-square" {...props} />;
export const PeopleFill = (props: IconProps) => <DynamicIcon name="people-fill" {...props} />;
export const People = (props: IconProps) => <DynamicIcon name="people" {...props} />;
export const PersonFill = (props: IconProps) => <DynamicIcon name="person-fill" {...props} />;
export const PersonPlusFill = (props: IconProps) => <DynamicIcon name="person-plus-fill" {...props} />;
export const PersonPlus = (props: IconProps) => <DynamicIcon name="person-plus" {...props} />;
export const PlusCircleFill = (props: IconProps) => <DynamicIcon name="plus-circle-fill" {...props} />;
export const PlusLg = (props: IconProps) => <DynamicIcon name="plus-lg" {...props} />;
export const QrCode = (props: IconProps) => <DynamicIcon name="qr-code" {...props} />;
export const Scissors = (props: IconProps) => <DynamicIcon name="scissors" {...props} />;
export const Search = (props: IconProps) => <DynamicIcon name="search" {...props} />;
export const SendFill = (props: IconProps) => <DynamicIcon name="send-fill" {...props} />;
export const SendIcon = (props: IconProps) => <DynamicIcon name="send" {...props} />;
export const Sticky = (props: IconProps) => <DynamicIcon name="sticky" {...props} />;
export const Telephone = (props: IconProps) => <DynamicIcon name="telephone" {...props} />;
export const ThreeDotsVertical = (props: IconProps) => <DynamicIcon name="three-dots-vertical" {...props} />;
export const XLg = (props: IconProps) => <DynamicIcon name="x-lg" {...props} />;
export const Calendar2 = (props: IconProps) => <DynamicIcon name="calendar2" {...props} />;
export const Calendar2Fill = (props: IconProps) => <DynamicIcon name="calendar2-fill" {...props} />;


// Lucide React equivalents
export const Loader2 = (props: IconProps) => <DynamicIcon name="arrow-clockwise" className={`animate-spin ${props.className || ''}`} {...props} />;
export const MessageSquare = (props: IconProps) => <DynamicIcon name="chat-left-text" {...props} />;
export const Edit2 = (props: IconProps) => <DynamicIcon name="pencil" {...props} />;
export const Trash2 = (props: IconProps) => <DynamicIcon name="trash" {...props} />;
export const Plus = (props: IconProps) => <DynamicIcon name="plus" {...props} />;
export const Wallet = (props: IconProps) => <DynamicIcon name="wallet" {...props} />;
export const Info = (props: IconProps) => <DynamicIcon name="info-circle" {...props} />;
export const ExclamationCircle = (props: IconProps) => <DynamicIcon name="exclamation-circle" {...props} />;
export const ExclamationCircleFill = (props: IconProps) => <DynamicIcon name="exclamation-circle-fill" {...props} />;
export const ArrowRight = (props: IconProps) => <DynamicIcon name="arrow-right" {...props} />;
export const Sparkles = (props: IconProps) => <DynamicIcon name="stars" {...props} />;
export const AlertTriangle = (props: IconProps) => <DynamicIcon name="exclamation-triangle" {...props} />;
export const LogOut = (props: IconProps) => <DynamicIcon name="box-arrow-right" {...props} />;
export const Users = (props: IconProps) => <DynamicIcon name="people" {...props} />;
export const MessageCircle = (props: IconProps) => <DynamicIcon name="chat" {...props} />;
export const Contact = (props: IconProps) => <DynamicIcon name="person-lines-fill" {...props} />;
export const Clock = (props: IconProps) => <DynamicIcon name="clock" {...props} />;
export const User = (props: IconProps) => <DynamicIcon name="person" {...props} />;
export const Check = (props: IconProps) => <DynamicIcon name="check" {...props} />;
export const X = (props: IconProps) => <DynamicIcon name="x" {...props} />;
export const MapPin = (props: IconProps) => <DynamicIcon name="geo-alt" {...props} />;
export const DollarSign = (props: IconProps) => <DynamicIcon name="currency-dollar" {...props} />;
export const Sun = (props: IconProps) => <DynamicIcon name="sun" {...props} />;
export const Moon = (props: IconProps) => <DynamicIcon name="moon" {...props} />;
export const ChevronLeft = (props: IconProps) => <DynamicIcon name="chevron-left" {...props} />;
export const ChevronRight = (props: IconProps) => <DynamicIcon name="chevron-right" {...props} />;
export const Calendar = (props: IconProps) => <DynamicIcon name="calendar" {...props} />;
export const List = (props: IconProps) => <DynamicIcon name="list" {...props} />;
export const CheckSquare = (props: IconProps) => <DynamicIcon name="check-square" {...props} />;
export const FileText = (props: IconProps) => <DynamicIcon name="file-text" {...props} />;
export const CheckCircle2 = (props: IconProps) => <DynamicIcon name="check-circle" {...props} />;
export const PartyPopper = (props: IconProps) => <DynamicIcon name="balloon" {...props} />;
export const RotateCcw = (props: IconProps) => <DynamicIcon name="arrow-counterclockwise" {...props} />;
export const Navigation = (props: IconProps) => <DynamicIcon name="compass" {...props} />;
export const UserPlus = (props: IconProps) => <DynamicIcon name="person-plus" {...props} />;
export const MessagesSquare = (props: IconProps) => <DynamicIcon name="chat-square-quote" {...props} />;
export const BarChart3 = (props: IconProps) => <DynamicIcon name="bar-chart" {...props} />;
export const ThumbsUp = (props: IconProps) => <DynamicIcon name="hand-thumbs-up" {...props} />;
export const MessageSquarePlus = (props: IconProps) => <DynamicIcon name="chat-left-text" {...props} />;
export const Pin = (props: IconProps) => <DynamicIcon name="pin" {...props} />;
export const Download = (props: IconProps) => <DynamicIcon name="download" {...props} />;
export const CalendarCheck = (props: IconProps) => <DynamicIcon name="calendar-check" {...props} />;
