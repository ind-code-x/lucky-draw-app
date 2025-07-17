// CreateGiveawayPage.tsx

import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  Gift,
  Plus,
  Calendar,
  Trophy,
  Sparkles,
  Save,
  Eye,
  X,
  Instagram,
  Twitter,
  Youtube,
  Globe,
  Facebook,
  Mail,
  CheckCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input'; // Ensure this file has forwardRef implemented for both
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useAuthStore } from '../../stores/authStore';
import { useGiveawayStore } from '../../stores/giveawayStore';
import toast from 'react-hot-toast';

interface GiveawayFormData {
  title: string;
  description: string;
  rules: string;
  start_time: string;
  end_time: string;
  announce_time: string;
  entry_methods: {
    type: string;
    value: string;
    points: number;
    required: boolean;
  }[];
  prizes: {
    name: string;
    value: number;
    quantity: number;
    description: string;
  }[];
}

export const CreateGiveawayPage: React.FC = () => {
  const { user, profile } = useAuthStore();
  const { createGiveaway } = useGiveawayStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Set default dates for initialization
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextWeekPlus1 = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);

  const defaultStartTime = now.toISOString().slice(0, 16);
  const defaultEndTime = nextWeek.toISOString().slice(0, 16);
  const defaultAnnounceTime = nextWeekPlus1.toISOString().slice(0, 16);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    trigger, // Import trigger for explicit validation
    formState: { errors }
  } = useForm<GiveawayFormData>({
    defaultValues: {
      title: '',
      description: '',
      rules: '',
      start_time: defaultStartTime,
      end_time: defaultEndTime,
      announce_time: defaultAnnounceTime,
      entry_methods: [
        { type: 'instagram_follow', value: '', points: 5, required: false },
      ],
      prizes: [{ name: '', value: 0, quantity: 1, description: '' }]
    }
  });

  const { fields: prizeFields, append: appendPrize, remove: removePrize } = useFieldArray({
    control,
    name: 'prizes'
  });
  
  const { fields: entryMethodFields, append: appendEntryMethod, remove: removeEntryMethod } = useFieldArray({
    control,
    name: 'entry_methods'
  });

  // Watch the required checkboxes to dynamically update validation
  useEffect(() => {
    entryMethodFields.forEach((field, index) => {
      const isRequired = watch(`entry_methods.${index}.required`);
      if (isRequired) {
        trigger(`entry_methods.${index}.value`);
      } else {
        if (errors.entry_methods?.[index]?.value) {
            trigger(`entry_methods.${index}.value`);
        }
      }
    });
  }, [entryMethodFields, watch, trigger, errors.entry_methods]); 

  if (!user || profile?.role !== 'organizer') {
    return <Navigate to="/dashboard" replace />;
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };
  
  const entryMethodOptions = [
    { value: 'instagram_follow', label: 'Follow on Instagram', icon: Instagram },
    { value: 'twitter_follow', label: 'Follow on Twitter', icon: Twitter },
    { value: 'facebook_like', label: 'Like Facebook Page', icon: Facebook },
    { value: 'youtube_subscribe', label: 'Subscribe on YouTube', icon: Youtube },
    { value: 'email_signup', label: 'Join Email List', icon: Mail },
    { value: 'website_visit', label: 'Visit Website', icon: Globe },
  ];

  const onSubmit = async (data: GiveawayFormData) => {
    debugger; // <--- SET THIS BREAKPOINT! Execution MUST pause here.
    console.log('*** onSubmit function STARTED ***'); // Console log to confirm execution path

    setLoading(true);
    try {
      console.log('Form data being submitted to onSubmit:', data); 
      
      // Client-side validation checks before calling the store (these are good)
      const invalidEntryMethods = data.entry_methods.filter(
        method => method.required && !method.value
      );
      if (invalidEntryMethods.length > 0) {
        toast.error('Please provide values for all required entry methods');
        setLoading(false);
        return;
      }
      
      const invalidPrizes = data.prizes.filter(prize => !prize.name);
      if (invalidPrizes.length > 0) {
        toast.error('Please provide a name for all prizes');
        setLoading(false);
        return;
      }
      
      const formattedPrizes = data.prizes.map(prize => ({
        name: prize.name,
        description: prize.description || '',
        value: Number(prize.value) || 0,
        quantity: Number(prize.quantity) || 1
      }));
      
      const slug = data.title ? generateSlug(data.title) : `giveaway-${Date.now()}`;
      
      // Validate dates if provided
      if (data.start_time && data.end_time) {
        const startTime = new Date(data.start_time);
        const endTime = new Date(data.end_time);
        if (startTime >= endTime) {
          toast.error('End time must be after start time');
          setLoading(false);
          return;
        }
        if (data.announce_time) {
          const announceTime = new Date(data.announce_time);
          if (endTime > announceTime) {
            toast.error('Announcement time must be after end time');
            setLoading(false);
            return;
          }
        }
      }
      
      // Convert entry methods to a config object
      const entry_config: { [key: string]: { enabled: boolean; points: number; value: string; required: boolean } } = {};
      data.entry_methods.forEach(method => {
        entry_config[method.type] = {
          enabled: true,
          points: Number(method.points) || 1,
          value: method.value || '',
          required: !!method.required
        };
      });
      
      const giveawayData = {
        organizer_id: user.id, // Ensure user.id is valid and exists in profiles table
        title: data.title,
        slug,
        description: data.description,
        rules: data.rules || '',
        start_time: data.start_time,
        end_time: data.end_time,
        announce_time: data.announce_time,
        status: 'active' as const, // Ensure status is explicitly 'active'
        entry_config,
        total_entries: 0,
        unique_participants: 0
      };

      console.log('Calling createGiveaway with:', { giveawayData, formattedPrizes }); // Final log before store call

      await createGiveaway(giveawayData, formattedPrizes); 

      toast.success('Giveaway created successfully! ✨');
      navigate('/dashboard');

    } catch (error) {
      console.error('Create giveaway error (from onSubmit catch):', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create giveaway');
    } finally {
      setLoading(false);
      console.log('*** onSubmit function FINISHED (finally block) ***');
    }
  };

  const addPrize = () => {
    appendPrize({ name: '', value: 0, quantity: 1, description: '' });
  };

  const removePrizeField = (index: number) => {
    if (prizeFields.length > 1) {
      removePrize(index);
    }
  };
  
  const addEntryMethod = () => {
    appendEntryMethod({ type: 'website_visit', value: '', points: 1, required: false });
  };
  
  const removeEntryMethodField = (index: number) => {
    if (entryMethodFields.length > 1) {
      removeEntryMethod(index);
    }
  };

  // Custom validation function for required entry methods
  const validateEntryMethodValue = (index: number) => {
    return (value: string) => {
      const isRequired = watch(`entry_methods.${index}.required`);
      if (isRequired && !value) {
        return 'Value is required for required methods';
      }
      return true;
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-maroon-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-br from-maroon-600 to-pink-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl relative">
            <Gift className="w-10 h-10 text-white" />
            <Sparkles className="w-4 h-4 text-pink-200 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-maroon-700 to-pink-600 bg-clip-text text-transparent mb-4">
            Create Magical Giveaway
          </h1>
          <p className="text-xl text-gray-600">
            Design an enchanting experience that will captivate your audience
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-maroon-800 flex items-center">
                <Gift className="w-6 h-6 mr-3 text-pink-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                label="Giveaway Title"
                placeholder="Enter an enchanting title for your giveaway"
                {...register('title', { required: 'Title is required' })}
                error={errors.title?.message}
                fullWidth
                className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
              />

              <Textarea
                label="Description"
                placeholder="Describe your magical giveaway and what makes it special..."
                rows={4}
                {...register('description', { required: 'Description is required' })}
                error={errors.description?.message}
                fullWidth
                className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
              />

              <Textarea
                label="Rules & Terms (Optional)"
                placeholder="Enter the rules and terms for your giveaway..."
                rows={3}
                {...register('rules')}
                error={errors.rules?.message}
                fullWidth
                className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
              />
            </CardContent>
          </Card>

          {/* Entry Methods */}
          <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-maroon-800 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-3 text-pink-600" />
                  Entry Methods
                </CardTitle>
                <Button
                  type="button"
                  onClick={addEntryMethod}
                  size="sm"
                  icon={Plus}
                  className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                >
                  Add Method
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {entryMethodFields.map((field, index) => {
                const methodType = watch(`entry_methods.${index}.type`);
                const isRequired = watch(`entry_methods.${index}.required`);
                const EntryIcon = entryMethodOptions.find(option => option.value === methodType)?.icon || Globe;

                return (
                  <div key={field.id} className="p-6 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 relative">
                    {entryMethodFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEntryMethodField(index)}
                        className="absolute top-4 right-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    <div className="flex items-center mb-4 gap-2">
                      <EntryIcon className="w-5 h-5 text-maroon-600" />
                      <h4 className="text-lg font-semibold text-maroon-800">Entry Method {index + 1}</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Method Type</label>
                        <select
                          {...register(`entry_methods.${index}.type`)}
                          className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:border-maroon-400 focus:ring-maroon-400 bg-white"
                        >
                          {entryMethodOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <Input
                        label={`Value ${isRequired ? '(Required)' : '(Optional)'}`}
                        placeholder={methodType.includes('instagram') ? "@username or URL" :
                          methodType.includes('website') ? "https://yourwebsite.com" :
                            "Profile URL or identifier"}
                        {...register(`entry_methods.${index}.value`, {
                          validate: validateEntryMethodValue(index)
                        })}
                        error={errors.entry_methods?.[index]?.value?.message}
                        fullWidth
                        className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
                      />

                      <Input
                        label="Points"
                        type="number"
                        min="1"
                        {...register(`entry_methods.${index}.points`, {
                          valueAsNumber: true,
                          min: { value: 1, message: 'Points must be at least 1' }
                        })}
                        error={errors.entry_methods?.[index]?.points?.message}
                        fullWidth
                        className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`required-${index}`}
                        className="rounded border-pink-300 text-maroon-600 focus:ring-maroon-500 h-5 w-5"
                        {...register(`entry_methods.${index}.required`)}
                        onChange={(e) => {
                          // Only perform side effects here.
                          if (e.target.checked) {
                            trigger(`entry_methods.${index}.value`);
                          } else {
                            trigger(`entry_methods.${index}.value`);
                          }
                        }}
                      />
                      <label htmlFor={`required-${index}`} className="ml-2 text-sm text-gray-700">
                        Make this entry method required
                      </label>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Timing */}
          <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-maroon-800 flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-pink-600" />
                Timing
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Start Date & Time"
                type="datetime-local"
                {...register('start_time')}
                error={errors.start_time?.message}
                fullWidth
                className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
              />

              <Input
                label="End Date & Time"
                type="datetime-local"
                {...register('end_time')}
                error={errors.end_time?.message}
                fullWidth
                className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
              />

              <Input
                label="Winner Announcement"
                type="datetime-local"
                {...register('announce_time')}
                error={errors.announce_time?.message}
                fullWidth
                className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
              />
            </CardContent>
          </Card>

          {/* Prizes */}
          <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-maroon-800 flex items-center">
                  <Trophy className="w-6 h-6 mr-3 text-pink-600" />
                  Prizes
                </CardTitle>
                <Button
                  type="button"
                  onClick={addPrize}
                  size="sm"
                  icon={Plus}
                  className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                >
                  Add Prize
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {prizeFields.map((field, index) => (
                <div key={field.id} className="p-6 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 relative">
                  {prizeFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePrizeField(index)}
                      className="absolute top-4 right-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  <h4 className="text-lg font-semibold text-maroon-800 mb-4">Prize {index + 1}</h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <Input
                      label="Prize Name"
                      placeholder="e.g., iPhone 15 Pro"
                      {...register(`prizes.${index}.name`, {
                        required: 'Prize name is required'
                      })}
                      error={errors.prizes?.[index]?.name?.message}
                      fullWidth
                      className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
                    />

                    <Input
                      label="Value"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register(`prizes.${index}.value`, {
                        valueAsNumber: true,
                        min: { value: 0, message: 'Value must be positive' }
                      })}
                      error={errors.prizes?.[index]?.value?.message}
                      fullWidth
                      className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
                    />

                    <Input
                      label="Quantity"
                      type="number"
                      min="1"
                      placeholder="1"
                      {...register(`prizes.${index}.quantity`, {
                        valueAsNumber: true,
                        min: { value: 1, message: 'Quantity must be at least 1' }
                      })}
                      error={errors.prizes?.[index]?.quantity?.message}
                      fullWidth
                      className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
                    />
                  </div>

                  <Textarea
                    label="Prize Description (Optional)"
                    placeholder="Describe this amazing prize..."
                    rows={2}
                    {...register(`prizes.${index}.description`)}
                    error={errors.prizes?.[index]?.description?.message}
                    fullWidth
                    className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              type="button"
              variant="outline"
              size="lg"
              icon={Eye}
              className="border-2 border-maroon-600 text-maroon-600 hover:bg-maroon-50"
              onClick={() => toast.success('Preview feature coming soon! ✨')}
            >
              Preview Giveaway
            </Button>
            <Button
              type="submit"
              loading={loading}
              size="lg"
              icon={Save}
              className="bg-gradient-to-r from-maroon-600 to-pink-600 hover:from-maroon-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 px-12"
            >
              Create Magical Giveaway
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
