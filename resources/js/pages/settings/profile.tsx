import { Form, Head, usePage, router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Camera, Trash2, Upload, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props;
    const { t } = useTranslation();

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Cropper State
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [naturalSize, setNaturalSize] = useState<{
        w: number;
        h: number;
    } | null>(null);

    const dragStart = useRef({ x: 0, y: 0 });
    const initialOffset = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (!imageUrl) {
            return;
        }

        const img = new Image();
        img.onload = () => {
            setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
        };
        img.src = imageUrl;
    }, [imageUrl]);

    useEffect(() => {
        return () => {
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [imageUrl]);

    const fitW = naturalSize
        ? naturalSize.w > naturalSize.h
            ? 256 * (naturalSize.w / naturalSize.h)
            : 256
        : 0;
    const fitH = naturalSize
        ? naturalSize.w <= naturalSize.h
            ? 256 * (naturalSize.h / naturalSize.w)
            : 256
        : 0;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('File size must be less than 2MB.');

                return;
            }

            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }

            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setImageUrl(url);
            setZoom(1);
            setOffset({ x: 0, y: 0 });
            setNaturalSize(null);
            setShowModal(true);
        }
    };

    const updateOffset = (newX: number, newY: number) => {
        if (!naturalSize) {
            return;
        }

        const V = 256;
        const maxX = Math.max(0, (fitW * zoom - V) / 2);
        const maxY = Math.max(0, (fitH * zoom - V) / 2);
        const clampedX = Math.min(maxX, Math.max(-maxX, newX));
        const clampedY = Math.min(maxY, Math.max(-maxY, newY));
        setOffset({ x: clampedX, y: clampedY });
    };

    const handleZoomChange = (newZoom: number) => {
        setZoom(newZoom);

        if (!naturalSize) {
            return;
        }

        const V = 256;
        const maxX = Math.max(0, (fitW * newZoom - V) / 2);
        const maxY = Math.max(0, (fitH * newZoom - V) / 2);
        setOffset((prev) => ({
            x: Math.min(maxX, Math.max(-maxX, prev.x)),
            y: Math.min(maxY, Math.max(-maxY, prev.y)),
        }));
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY };
        initialOffset.current = offset;
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (e.touches.length === 1) {
            setIsDragging(true);
            dragStart.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
            };
            initialOffset.current = offset;
        }
    };

    useEffect(() => {
        if (!isDragging) {
            return;
        }

        const handleMouseMove = (e: MouseEvent) => {
            const dx = e.clientX - dragStart.current.x;
            const dy = e.clientY - dragStart.current.y;
            updateOffset(
                initialOffset.current.x + dx,
                initialOffset.current.y + dy,
            );
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 1) {
                const dx = e.touches[0].clientX - dragStart.current.x;
                const dy = e.touches[0].clientY - dragStart.current.y;
                updateOffset(
                    initialOffset.current.x + dx,
                    initialOffset.current.y + dy,
                );
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging, zoom, fitW, fitH, naturalSize]);

    const handleCropSave = () => {
        if (!imageUrl || !naturalSize) {
            return;
        }

        setIsUploading(true);

        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 300;
            canvas.height = 300;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                setIsUploading(false);

                return;
            }

            const V = 256;
            const C = 300;
            const canvasScale = C / V;

            const tx = offset.x + (V - fitW) / 2;
            const ty = offset.y + (V - fitH) / 2;
            const cx = fitW / 2;
            const cy = fitH / 2;

            const xCanvas = (tx + cx * (1 - zoom)) * canvasScale;
            const yCanvas = (ty + cy * (1 - zoom)) * canvasScale;
            const wCanvas = fitW * zoom * canvasScale;
            const hCanvas = fitH * zoom * canvasScale;

            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, C, C);
            ctx.drawImage(img, xCanvas, yCanvas, wCanvas, hCanvas);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const file = new File([blob], 'avatar.jpg', {
                            type: 'image/jpeg',
                        });
                        router.post(
                            '/settings/profile/avatar',
                            { avatar: file },
                            {
                                forceFormData: true,
                                preserveScroll: true,
                                onSuccess: () => {
                                    setShowModal(false);
                                    setSelectedFile(null);
                                    setImageUrl(null);
                                },
                                onFinish: () => {
                                    setIsUploading(false);
                                },
                                onError: (errors) => {
                                    toast.error(
                                        errors.avatar ||
                                            'Failed to upload profile picture.',
                                    );
                                },
                            },
                        );
                    } else {
                        setIsUploading(false);
                        toast.error('Failed to crop image.');
                    }
                },
                'image/jpeg',
                0.9,
            );
        };
    };

    const handleRemoveAvatar = () => {
        if (confirm('Are you sure you want to remove your profile picture?')) {
            setIsDeleting(true);
            router.delete('/settings/profile/avatar', {
                preserveScroll: true,
                onFinish: () => setIsDeleting(false),
            });
        }
    };

    const initials = auth.user.name
        ? auth.user.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()
        : '';

    return (
        <>
            <Head title={t('Profile settings')} />

            <h1 className="sr-only">{t('Profile settings')}</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={t('Profile')}
                    description={t('Update your name and email address')}
                />

                {/* Profile Picture Uploader */}
                <div className="flex flex-col items-center gap-6 border-b border-border/40 pb-6 sm:flex-row">
                    <div className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-arabic-gold/30 bg-arabic-cream text-arabic-bronze shadow-md select-none">
                        {auth.user.avatar ? (
                            <img
                                src={auth.user.avatar}
                                alt={auth.user.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="font-serif text-3xl font-bold tracking-wider">
                                {initials}
                            </span>
                        )}
                        <label
                            htmlFor="avatar-upload-input"
                            className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                        >
                            <Camera className="h-6 w-6 text-white" />
                        </label>
                    </div>

                    <div className="flex flex-col items-center gap-2 sm:items-start">
                        <h3 className="font-serif text-lg font-bold text-arabic-bronze dark:text-arabic-sand">
                            {t('Profile Picture')}
                        </h3>
                        <p className="text-center text-xs text-muted-foreground sm:text-left">
                            {t('Upload a PNG or JPEG. Max 2MB. Image will be cropped to a 1:1 ratio.')}
                        </p>
                        <div className="mt-1 flex items-center gap-3">
                            <input
                                id="avatar-upload-input"
                                type="file"
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex cursor-pointer items-center gap-1.5 rounded-full border-arabic-bronze/25 text-arabic-bronze hover:bg-arabic-cream"
                                asChild
                            >
                                <label htmlFor="avatar-upload-input">
                                    <Upload className="h-3.5 w-3.5" />
                                    {t('Upload Picture')}
                                </label>
                            </Button>

                            {auth.user.avatar && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-full text-destructive hover:bg-destructive/10"
                                    onClick={handleRemoveAvatar}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-3.5 w-3.5" />
                                    )}
                                    {t('Remove')}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Cropping Modal */}
                <Dialog
                    open={showModal}
                    onOpenChange={(open) => {
                        if (!open && !isUploading) {
                            setShowModal(false);
                            setSelectedFile(null);
                            setImageUrl(null);
                        }
                    }}
                >
                    <DialogContent className="border-border bg-background sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="font-serif text-xl font-bold text-arabic-bronze dark:text-arabic-sand">
                                {t('Crop Profile Picture')}
                            </DialogTitle>
                            <DialogDescription>
                                {t('Drag the image to position it and use the slider to zoom.')}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col items-center justify-center p-4">
                            <div
                                className="relative h-64 w-64 cursor-grab touch-none overflow-hidden rounded-full border-2 border-arabic-gold bg-neutral-900 shadow-inner select-none active:cursor-grabbing"
                                onMouseDown={handleMouseDown}
                                onTouchStart={handleTouchStart}
                            >
                                {imageUrl && fitW > 0 && (
                                    <img
                                        src={imageUrl}
                                        alt="To crop"
                                        draggable={false}
                                        className="pointer-events-none absolute max-w-none origin-center select-none"
                                        style={{
                                            width: fitW,
                                            height: fitH,
                                            left: (256 - fitW) / 2,
                                            top: (256 - fitH) / 2,
                                            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 px-4">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold tracking-wider text-arabic-bronze/60 uppercase dark:text-arabic-sand/60">
                                    {t('Zoom')}
                                </span>
                                <input
                                    type="range"
                                    min="1"
                                    max="3"
                                    step="0.01"
                                    value={zoom}
                                    onChange={(e) =>
                                        handleZoomChange(
                                            parseFloat(e.target.value),
                                        )
                                    }
                                    className="h-1.5 flex-1 cursor-pointer rounded-full bg-arabic-cream accent-arabic-gold dark:bg-neutral-800"
                                />
                                <span className="min-w-[30px] text-right text-xs font-semibold text-arabic-bronze dark:text-arabic-sand">
                                    {Math.round(zoom * 100)}%
                                </span>
                            </div>
                        </div>

                        <DialogFooter className="mt-4 flex flex-col justify-end gap-2 sm:flex-row">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedFile(null);
                                    setImageUrl(null);
                                }}
                                disabled={isUploading}
                                className="w-full rounded-full border-arabic-bronze/25 text-arabic-bronze hover:bg-arabic-cream sm:w-auto"
                            >
                                {t('Cancel')}
                            </Button>
                            <Button
                                onClick={handleCropSave}
                                disabled={isUploading}
                                className="flex w-full items-center justify-center gap-2 rounded-full bg-arabic-bronze text-arabic-sand hover:bg-arabic-bronze/90 sm:w-auto"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {t('Uploading...')}
                                    </>
                                ) : (
                                    t('Apply & Save')
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">{t('Name')}</Label>

                                <Input
                                    id="name"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder={t('Full name')}
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.name}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">{t('Email address')}</Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder={t('Email address')}
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.email}
                                />
                            </div>

                            {mustVerifyEmail &&
                                auth.user.email_verified_at === null && (
                                    <div>
                                        <p className="-mt-4 text-sm text-muted-foreground">
                                            {t('Your email address is unverified.')}{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                            >
                                                {t('Click here to re-send the verification email.')}
                                            </Link>
                                        </p>

                                        {status ===
                                            'verification-link-sent' && (
                                            <div className="mt-2 text-sm font-medium text-green-600">
                                                {t('A new verification link has been sent to your email address.')}
                                            </div>
                                        )}
                                    </div>
                                )}

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="update-profile-button"
                                >
                                    {t('Save')}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};
