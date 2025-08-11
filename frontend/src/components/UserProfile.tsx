import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  User as UserIcon,
  UserCircle2,
} from "lucide-react";
import { User } from "@/types";

const SERVER_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER_BASE_URL || "http://localhost:8000";

export function UserProfile({ user }: { user: User }) {
  return (
    <Card className="mx-auto shadow-lg">
      <CardContent className="p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 border-b pb-6">
          <Avatar className="h-28 w-28 border-2 border-gray-200">
            {user.profile_image ? (
              <AvatarImage
                src={SERVER_BASE_URL + user.profile_image}
                alt={`${user.first_name} ${user.last_name}`}
              />
            ) : (
              <AvatarFallback className="text-2xl font-semibold bg-gray-100">
                {user.first_name[0]?.toUpperCase()}
                {user.last_name[0]?.toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-900">
              {user.first_name} {user.last_name}
            </h1>
            <div className="mt-2">
              <Badge variant="secondary" className="capitalize">
                {user.role}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Member since {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          {/* Contact Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-gray-900 font-medium">Email:</span>
                <span className="text-gray-700">{user.email}</span>
              </div>

              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900 font-medium">Phone:</span>
                  <span className="text-gray-700">{user.phone}</span>
                </div>
              )}

              {user.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900 font-medium">Address:</span>
                  <span className="text-gray-700">{user.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Personal Information */}
          {(user.gender || user.dob) && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Personal Information
              </h2>
              <div className="space-y-3">
                {user.gender && (
                  <div className="flex items-center gap-3">
                    <UserCircle2 className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-900 font-medium">Gender:</span>
                    <span className="capitalize text-gray-700">
                      {user.gender}
                    </span>
                  </div>
                )}

                {user.dob && (
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-900 font-medium">
                      Date of Birth:
                    </span>
                    <span className="text-gray-700">
                      {new Date(user.dob).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
