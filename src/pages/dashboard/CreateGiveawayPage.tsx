import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { 
  Gift, 
  Plus, 
  Trash2, 
  Calendar, 
  Trophy,
  Sparkles,
  Save,
  Eye,
  Upload,
  X
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
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

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<GiveawayFormData>({
    defaultValues: {
      title: '',
      description: '',
      rules: '',
      start_time: '',
      end_time: '',
      announce_time: '',
      prizes: [{ name: '', value: 0, quantity: 1, description: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'prizes'
  });

  if (!user || profile?.role !== 'organizer') {
    return <Navigate to="/dashboard" replace />;
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const onSubmit = async (data: GiveawayFormData) => {
    setLoading(true);
    try {
      const slug = generateSlug(data.title);
      
      const giveawayData = {
        organizer_id: user.id,
        title: data.title,
        slug,
        description: data.description,
        rules: data.rules,
        start_time: data.start_time,
        end_time: data.end_time,
        announce_time: data.announce_time,
        status: 'pending' as const,
        entry_config: {
          email_signup: { enabled: true, points: 5 },
          social_follow: { enabled: true, points: 3 },
          referral: { enabled: true, points: 10 }
        }
      };

      const giveawayId = await createGiveaway(giveawayData, data.prizes);
      toast.success('Giveaway created successfully! ✨');
      navigate(`/dashboard/giveaway/${giveawayId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create giveaway');
    } finally {
      setLoading(false);
    }
  };

  const addPrize = () => {
    append({ name: '', value: 0, quantity: 1, description: '' });
  };

  const removePrize = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-maroon-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-br from-maroon-600 to-pink-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
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
                label="Rules & Terms"
                placeholder="Enter the rules and terms for your giveaway..."
                rows={3}
                {...register('rules')}
                error={errors.rules?.message}
                fullWidth
                className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
              />
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
                {...register('start_time', { required: 'Start time is required' })}
                error={errors.start_time?.message}
                fullWidth
                className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
              />

              <Input
                label="End Date & Time"
                type="datetime-local"
                {...register('end_time', { required: 'End time is required' })}
                error={errors.end_time?.message}
                fullWidth
                className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
              />

              <Input
                label="Winner Announcement"
                type="datetime-local"
                {...register('announce_time', { required: 'Announcement time is required' })}
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
              {fields.map((field, index) => (
                <div key={field.id} className="p-6 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 relative">
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePrize(index)}
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
                      {...register(`prizes.${index}.name`, { required: 'Prize name is required' })}
                      error={errors.prizes?.[index]?.name?.message}
                      fullWidth
                      className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
                    />

                    <Input
                      label="Value ($)"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register(`prizes.${index}.value`, { 
                        required: 'Prize value is required',
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
                        required: 'Quantity is required',
                        min: { value: 1, message: 'Quantity must be at least 1' }
                      })}
                      error={errors.prizes?.[index]?.quantity?.message}
                      fullWidth
                      className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
                    />
                  </div>

                  <Textarea
                    label="Prize Description"
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